/**
 * Admin Routes
 * Routes for admin management operations
 */

import { Router, type Router as RouterType } from "express";
import {
  promoteToAdminController,
  demoteFromAdminController,
  listAdminsController,
} from "../controller/admin.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router: RouterType = Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize("ADMIN"));

// Admin management routes
router.post("/promote", promoteToAdminController);
router.post("/demote", demoteFromAdminController);
router.get("/list", listAdminsController);

export default router;
