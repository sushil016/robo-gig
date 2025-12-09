import { wrapTemplate, type EmailTemplate } from "./base.js";

export function orderCreatedTemplate(data: {
  order: {
    orderId: string;
    total: number;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    shippingAddress?: string;
    estimatedDelivery?: string;
  };
  user?: {
    name: string;
  };
}): EmailTemplate {
  const itemsHtml = data.order.items
    .map(
      (item) => `
    <tr>
      <td>${item.name}</td>
      <td class="text-center">${item.quantity}</td>
      <td class="text-center">₹${item.price.toLocaleString()}</td>
      <td class="text-center"><strong>₹${(item.quantity * item.price).toLocaleString()}</strong></td>
    </tr>
  `
    )
    .join("");

  const content = `
    <h1>Order Confirmed! 🎉</h1>
    <p>Hi ${data.user?.name || "there"},</p>
    <p>
      Thank you for your order! We've received it and are getting it ready for shipment.
    </p>

    <div class="info-box">
      <p><strong>Order ID:</strong> ${data.order.orderId}</p>
      ${data.order.estimatedDelivery ? `<p><strong>Estimated Delivery:</strong> ${data.order.estimatedDelivery}</p>` : ""}
    </div>

    <h2>Order Details</h2>
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th class="text-center">Quantity</th>
          <th class="text-center">Price</th>
          <th class="text-center">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3" class="text-center"><strong>Total Amount:</strong></td>
          <td class="text-center"><strong>₹${data.order.total.toLocaleString()}</strong></td>
        </tr>
      </tfoot>
    </table>

    ${
      data.order.shippingAddress
        ? `
    <h2>Shipping Address</h2>
    <div class="info-box">
      <p>${data.order.shippingAddress}</p>
    </div>
    `
        : ""
    }

    <p class="text-center">
      <a href="https://buildwise.com/orders/${data.order.orderId}" class="button">Track Your Order</a>
    </p>

    <p>
      You'll receive another email once your order has been shipped with tracking information.
    </p>

    <p>
      Questions about your order? Contact us at 
      <a href="mailto:orders@buildwise.com">orders@buildwise.com</a>
    </p>

    <p>
      Thank you for shopping with BuildWise! 🚀<br>
      The BuildWise Team
    </p>
  `;

  return {
    subject: `Order Confirmed - ${data.order.orderId}`,
    html: wrapTemplate(content),
    text: `Order Confirmed! 🎉

Hi ${data.user?.name || "there"},

Thank you for your order! We've received it and are getting it ready for shipment.

Order ID: ${data.order.orderId}
${data.order.estimatedDelivery ? `Estimated Delivery: ${data.order.estimatedDelivery}` : ""}

Order Details:
${data.order.items.map((item) => `• ${item.name} - Qty: ${item.quantity} - ₹${item.price} - Total: ₹${item.quantity * item.price}`).join("\n")}

Total Amount: ₹${data.order.total.toLocaleString()}

${data.order.shippingAddress ? `Shipping Address:\n${data.order.shippingAddress}` : ""}

Track your order: https://buildwise.com/orders/${data.order.orderId}

You'll receive another email once your order has been shipped with tracking information.

Questions? Contact us at orders@buildwise.com

Thank you for shopping with BuildWise! 🚀
The BuildWise Team`,
  };
}
