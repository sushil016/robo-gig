/**
 * Component Routes
 * API routes for component management
 */

import { Router, type Router as RouterType } from "express";
import * as componentController from "../controllers/component.controller.js";
import { authenticate, authorize } from "../../../middlewares/auth.middleware.js";

const router: RouterType = Router();

// Public routes (no authentication required)
router.get("/", componentController.getComponentsHandler);
router.get("/:id", componentController.getComponentByIdHandler);

// Admin routes (authentication + admin role required)
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  componentController.createComponentHandler
);

router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  componentController.updateComponentHandler
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  componentController.deleteComponentHandler
);

router.patch(
  "/:id/stock",
  authenticate,
  authorize("ADMIN"),
  componentController.updateStockHandler
);

// Admin analytics routes
router.get(
  "/analytics/low-stock",
  authenticate,
  authorize("ADMIN"),
  componentController.getLowStockHandler
);

router.get(
  "/analytics/out-of-stock",
  authenticate,
  authorize("ADMIN"),
  componentController.getOutOfStockHandler
);

export default router;
