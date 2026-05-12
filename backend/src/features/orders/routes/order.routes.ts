import { Router, type Router as ExpressRouter } from "express";
import { authenticate, authorize } from "../../../middlewares/auth.middleware.js";
import {
  cancelOrderHandler,
  confirmPaymentHandler,
  createOrderHandler,
  getAllOrdersHandler,
  getMyOrdersHandler,
  getOrderHandler,
  updateAdminOrderStatusHandler,
  validateCouponHandler,
} from "../controllers/order.controller.js";

const router: ExpressRouter = Router();

router.use(authenticate);

router.post("/", createOrderHandler);
router.post("/coupons/validate", validateCouponHandler);
router.get("/admin/all", authorize("ADMIN"), getAllOrdersHandler);
router.patch("/admin/:id/status", authorize("ADMIN"), updateAdminOrderStatusHandler);
router.get("/my", getMyOrdersHandler);
router.get("/:id", getOrderHandler);
router.post("/:id/payments/confirm", confirmPaymentHandler);
router.post("/:id/cancel", cancelOrderHandler);

export default router;
