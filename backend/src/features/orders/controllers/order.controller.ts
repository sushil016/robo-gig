import type { Request, Response } from "express";
import { PaymentGateway } from "../../../generated/prisma/client.js";
import {
  cancelUserOrder,
  createOrder,
  getAllOrders,
  getUserOrderById,
  getUserOrders,
  validateCoupon,
} from "../services/order.service.js";

function userIdFromRequest(req: Request) {
  const userId = req.user?.userId;

  if (!userId) {
    throw new Error("User is not authenticated");
  }

  return userId;
}

export async function createOrderHandler(req: Request, res: Response) {
  try {
    const payload = await createOrder({
      userId: userIdFromRequest(req),
      items: Array.isArray(req.body.items) ? req.body.items : [],
      shippingAddress: req.body.shippingAddress,
      shippingAddressId: req.body.shippingAddressId,
      paymentGateway: req.body.paymentGateway || PaymentGateway.TEST,
      couponCode: req.body.couponCode,
      notes: req.body.notes,
    });

    res.status(201).json({
      success: true,
      data: payload,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to create order",
    });
  }
}

export async function validateCouponHandler(req: Request, res: Response) {
  try {
    const subtotalCents = Number(req.body.subtotalCents || 0);
    const shippingCents = Number(req.body.shippingCents || 0);
    const coupon = validateCoupon(req.body.code, subtotalCents, shippingCents);

    res.json({
      success: true,
      data: coupon,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : "Coupon validation failed",
    });
  }
}

export async function getAllOrdersHandler(_req: Request, res: Response) {
  const orders = await getAllOrders();

  res.json({
    success: true,
    data: orders,
  });
}

export async function getMyOrdersHandler(req: Request, res: Response) {
  const orders = await getUserOrders(userIdFromRequest(req));

  res.json({
    success: true,
    data: orders,
  });
}

export async function getOrderHandler(req: Request, res: Response) {
  const orderId = req.params.id;

  if (!orderId) {
    res.status(400).json({
      success: false,
      error: "Order ID is required",
    });
    return;
  }

  const order = await getUserOrderById(userIdFromRequest(req), orderId);

  if (!order) {
    res.status(404).json({
      success: false,
      error: "Order not found",
    });
    return;
  }

  res.json({
    success: true,
    data: order,
  });
}

export async function cancelOrderHandler(req: Request, res: Response) {
  try {
    const orderId = req.params.id;

    if (!orderId) {
      res.status(400).json({
        success: false,
        error: "Order ID is required",
      });
      return;
    }

    const order = await cancelUserOrder(userIdFromRequest(req), orderId);

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to cancel order",
    });
  }
}
