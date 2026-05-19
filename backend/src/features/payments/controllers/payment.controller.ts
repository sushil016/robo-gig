import type { Request, Response } from "express";
import * as razorpayService from "../services/razorpay.service.js";

export async function initiatePaymentHandler(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const orderId = req.params.orderId as string;

  try {
    const idempotencyKey = req.headers["x-idempotency-key"] as string | undefined;
    const data = await razorpayService.initiatePayment(orderId, userId, idempotencyKey);
    res.json({ success: true, data });
  } catch (err) {
    const error = err as Error & { statusCode?: number };
    res.status(error.statusCode ?? 500).json({ success: false, error: error.message });
  }
}

export async function verifyPaymentHandler(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const orderId = req.params.orderId as string;
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body as {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  };

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    res.status(400).json({ success: false, error: "razorpayOrderId, razorpayPaymentId, and razorpaySignature are required" });
    return;
  }

  try {
    await razorpayService.verifyAndConfirmPayment(orderId, userId, razorpayOrderId, razorpayPaymentId, razorpaySignature);
    res.json({ success: true, message: "Payment verified and order confirmed" });
  } catch (err) {
    const error = err as Error & { statusCode?: number };
    res.status(error.statusCode ?? 400).json({ success: false, error: error.message });
  }
}

// Raw-body webhook handler — express.raw() is applied at route level
export async function razorpayWebhookHandler(req: Request, res: Response): Promise<void> {
  const signature = req.headers["x-razorpay-signature"] as string;

  if (!signature) {
    res.status(400).json({ success: false, error: "Missing signature header" });
    return;
  }

  try {
    await razorpayService.handleWebhook(req.body as Buffer, signature);
    res.status(200).json({ received: true });
  } catch (err) {
    const error = err as Error & { statusCode?: number };
    res.status(error.statusCode ?? 400).json({ success: false, error: error.message });
  }
}
