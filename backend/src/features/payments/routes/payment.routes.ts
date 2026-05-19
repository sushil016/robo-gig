import express, { Router, type Router as RouterType } from "express";
import { authenticate } from "../../../middlewares/auth.middleware.js";
import {
  initiatePaymentHandler,
  razorpayWebhookHandler,
  verifyPaymentHandler,
} from "../controllers/payment.controller.js";

const router: RouterType = Router();

// Webhook — raw body required for signature verification, NO auth
router.post(
  "/webhook/razorpay",
  express.raw({ type: "application/json" }),
  razorpayWebhookHandler,
);

// Initiate: creates a Razorpay order and returns credentials for frontend modal
router.post("/:orderId/initiate", authenticate, initiatePaymentHandler);

// Verify: frontend-side success callback — verify signature and confirm order
router.post("/:orderId/verify", authenticate, verifyPaymentHandler);

export default router;
