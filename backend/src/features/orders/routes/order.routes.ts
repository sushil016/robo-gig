import { Router, type Router as ExpressRouter } from "express";
import { authenticate, authorize } from "../../../middlewares/auth.middleware.js";
import {
  cancelOrderHandler,
  createOrderHandler,
  getAllOrdersHandler,
  getMyOrdersHandler,
  getOrderHandler,
  validateCouponHandler,
} from "../controllers/order.controller.js";

const router: ExpressRouter = Router();

router.use(authenticate);

router.post("/", createOrderHandler);
router.post("/coupons/validate", validateCouponHandler);
router.get("/admin/all", authorize("ADMIN"), getAllOrdersHandler);
router.get("/my", getMyOrdersHandler);
router.get("/:id", getOrderHandler);
router.post("/:id/cancel", cancelOrderHandler);

export default router;
