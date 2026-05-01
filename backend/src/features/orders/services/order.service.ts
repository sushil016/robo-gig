import { prisma } from "../../../lib/prisma.js";
import {
  OrderItemType,
  OrderStatus,
  OrderType,
  PaymentGateway,
  PaymentStatus,
} from "../../../generated/prisma/client.js";

type CheckoutAddress = {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
};

type CreateOrderInput = {
  userId: string;
  items: {
    componentId: string;
    quantity: number;
  }[];
  shippingAddress?: CheckoutAddress;
  shippingAddressId?: string;
  paymentGateway?: PaymentGateway;
  couponCode?: string;
  notes?: string;
};

export type CouponValidation = {
  code: string;
  label: string;
  discountCents: number;
};

const coupons = [
  {
    code: "ROBO10",
    label: "10% off electronics order",
    type: "PERCENT",
    value: 10,
    minSubtotalCents: 100000,
    maxDiscountCents: 50000,
  },
  {
    code: "STUDENT250",
    label: "Student project discount",
    type: "FIXED",
    value: 25000,
    minSubtotalCents: 200000,
  },
  {
    code: "FREESHIP",
    label: "Free shipping coupon",
    type: "SHIPPING",
    value: 5000,
    minSubtotalCents: 0,
  },
] as const;

export function validateCoupon(code: string | undefined, subtotalCents: number, shippingCents = 0): CouponValidation | null {
  if (!code?.trim()) {
    return null;
  }

  const normalizedCode = code.trim().toUpperCase();
  const coupon = coupons.find((item) => item.code === normalizedCode);

  if (!coupon) {
    throw new Error("Coupon code is invalid");
  }

  if (subtotalCents < coupon.minSubtotalCents) {
    throw new Error(`Coupon requires a minimum order value of ₹${coupon.minSubtotalCents / 100}`);
  }

  let discountCents = 0;

  if (coupon.type === "PERCENT") {
    discountCents = Math.round((subtotalCents * coupon.value) / 100);
    discountCents = Math.min(discountCents, coupon.maxDiscountCents);
  } else if (coupon.type === "FIXED") {
    discountCents = coupon.value;
  } else {
    discountCents = Math.min(shippingCents, coupon.value);
  }

  discountCents = Math.min(discountCents, subtotalCents + shippingCents);

  return {
    code: coupon.code,
    label: coupon.label,
    discountCents,
  };
}

function assertAddress(address?: CheckoutAddress) {
  if (!address) {
    throw new Error("Shipping address is required");
  }

  const requiredFields: Array<keyof CheckoutAddress> = ["name", "phone", "line1", "city", "state", "pincode"];

  for (const field of requiredFields) {
    if (!address[field]?.trim()) {
      throw new Error(`Shipping address ${field} is required`);
    }
  }
}

export async function createOrder(input: CreateOrderInput) {
  if (!input.items.length) {
    throw new Error("Order must include at least one item");
  }

  const normalizedItems = input.items.map((item) => ({
    componentId: item.componentId,
    quantity: Math.max(1, Math.floor(item.quantity || 1)),
  }));

  const components = await prisma.component.findMany({
    where: {
      id: { in: normalizedItems.map((item) => item.componentId) },
      isActive: true,
    },
  });

  if (components.length !== normalizedItems.length) {
    throw new Error("One or more components are not available");
  }

  const componentById = new Map(components.map((component) => [component.id, component]));

  for (const item of normalizedItems) {
    const component = componentById.get(item.componentId);

    if (!component || component.stockQuantity < item.quantity) {
      throw new Error(`${component?.name || "Component"} does not have enough stock`);
    }
  }

  assertAddress(input.shippingAddress);

  const subtotalCents = normalizedItems.reduce((sum, item) => {
    const component = componentById.get(item.componentId);
    return sum + (component?.unitPriceCents || 0) * item.quantity;
  }, 0);

  const shippingCents = subtotalCents >= 50000 ? 0 : 5000;
  const coupon = validateCoupon(input.couponCode, subtotalCents, shippingCents);
  const totalAmountCents = Math.max(0, subtotalCents + shippingCents - (coupon?.discountCents || 0));
  const gateway = input.paymentGateway || PaymentGateway.TEST;
  const isTestPayment = gateway === PaymentGateway.TEST;

  return prisma.$transaction(async (tx) => {
    const address = input.shippingAddressId
      ? await tx.address.findFirstOrThrow({
          where: {
            id: input.shippingAddressId,
            userId: input.userId,
          },
        })
      : await tx.address.create({
          data: {
            userId: input.userId,
            name: input.shippingAddress!.name.trim(),
            phone: input.shippingAddress!.phone.trim(),
            line1: input.shippingAddress!.line1.trim(),
            line2: input.shippingAddress!.line2?.trim() || null,
            city: input.shippingAddress!.city.trim(),
            state: input.shippingAddress!.state.trim(),
            pincode: input.shippingAddress!.pincode.trim(),
            country: input.shippingAddress!.country?.trim() || "India",
          },
        });

    const order = await tx.order.create({
      data: {
        userId: input.userId,
        addressId: address.id,
        orderType: OrderType.COMPONENTS_ONLY,
        status: isTestPayment ? OrderStatus.PAID : OrderStatus.PENDING_PAYMENT,
        totalAmountCents,
        notes: [
          input.notes,
          coupon ? `Coupon ${coupon.code}: -₹${coupon.discountCents / 100}` : null,
        ]
          .filter(Boolean)
          .join("\n") || null,
        items: {
          create: normalizedItems.map((item) => {
            const component = componentById.get(item.componentId)!;

            return {
              itemType: OrderItemType.COMPONENT,
              componentId: component.id,
              description: component.name,
              quantity: item.quantity,
              unitPriceCents: component.unitPriceCents,
              subtotalCents: component.unitPriceCents * item.quantity,
            };
          }),
        },
        payments: {
          create: {
            gateway,
            amountCents: totalAmountCents,
            status: isTestPayment ? PaymentStatus.SUCCESS : PaymentStatus.CREATED,
            gatewayOrderId: `rr_${Date.now()}`,
            rawPayload: {
              mode: isTestPayment ? "test" : "gateway_pending",
              subtotalCents,
              shippingCents,
              coupon,
              discountCents: coupon?.discountCents || 0,
            },
          },
        },
      },
      include: {
        address: true,
        items: {
          include: {
            component: true,
          },
        },
        payments: true,
      },
    });

    if (isTestPayment) {
      await Promise.all(
        normalizedItems.map((item) =>
          tx.component.update({
            where: { id: item.componentId },
            data: { stockQuantity: { decrement: item.quantity } },
          })
        )
      );
    }

    return {
      order,
      paymentUrl: isTestPayment ? undefined : `/checkout/payment/${order.id}`,
    };
  });
}

export async function getUserOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      address: true,
      items: {
        include: {
          component: true,
        },
      },
      payments: true,
    },
  });
}

export async function getAllOrders() {
  return prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      address: true,
      items: {
        include: {
          component: true,
        },
      },
      payments: true,
    },
  });
}

export async function getUserOrderById(userId: string, orderId: string) {
  return prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
    },
    include: {
      address: true,
      items: {
        include: {
          component: true,
        },
      },
      payments: true,
    },
  });
}

export async function cancelUserOrder(userId: string, orderId: string) {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  const cancellableStatuses: OrderStatus[] = [
    OrderStatus.PENDING_PAYMENT,
    OrderStatus.PAID,
    OrderStatus.PROCESSING,
  ];

  if (!cancellableStatuses.includes(order.status)) {
    throw new Error("This order can no longer be cancelled");
  }

  return prisma.order.update({
    where: { id: orderId },
    data: {
      status: OrderStatus.CANCELLED,
    },
  });
}
