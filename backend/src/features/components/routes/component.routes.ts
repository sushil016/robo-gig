/**
 * Component Routes
 * API routes for component management
 */

import { Router, type Router as RouterType } from "express";
import * as componentController from "../controllers/component.controller.js";
import { handleCreateComponentWithUploads } from "../controllers/component-upload.controller.js";
import { authenticate, authorize } from "../../../middlewares/auth.middleware.js";
import { uploadComponentImages } from "../../../middlewares/upload.middleware.js";

const router: RouterType = Router();

// Public routes (no authentication required)
router.get("/", componentController.getComponentsHandler);
router.get("/categories/tree", componentController.getCategoryTreeHandler);
router.get("/:id", componentController.getComponentByIdHandler);

// Admin routes (authentication + admin role required)

/**
 * Create component with image uploads
 * POST /api/components/upload
 * Access: Admin only
 * Content-Type: multipart/form-data
 * 
 * Form Fields:
 * - images: File[] (max 5, JPEG/PNG/WebP, max 5MB each)
 * - thumbnail: File (optional, JPEG/PNG/WebP, max 5MB)
 * - name: string (required)
 * - sku: string (optional, unique)
 * - description: string (optional)
 * - typicalUseCase: string (optional)
 * - vendorLink: string (optional)
 * - unitPriceCents: number (required, price in cents)
 * - stockQuantity: number (optional, default: 0)
 * - isActive: boolean (optional, default: true)
 */
router.post(
  "/upload",
  authenticate,
  authorize("ADMIN"),
  uploadComponentImages,
  handleCreateComponentWithUploads
);

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
