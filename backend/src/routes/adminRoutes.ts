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
import {
  listCustomersHandler,
  getCustomerDetailHandler,
  updateCustomerStatusHandler,
} from "../features/admin/controllers/customer.controller.js";
import {
  revenueHandler,
  ordersHandler,
  topProductsHandler,
  lowStockHandler,
  dashboardKpisHandler,
} from "../features/admin/controllers/analytics.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router: RouterType = Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize("ADMIN"));

// Admin management routes
router.post("/promote", promoteToAdminController);
router.post("/demote", demoteFromAdminController);
router.get("/list", listAdminsController);

// Customer management
router.get("/customers", listCustomersHandler);
router.get("/customers/:id", getCustomerDetailHandler);
router.patch("/customers/:id/status", updateCustomerStatusHandler);

// Analytics
router.get("/analytics/kpis", dashboardKpisHandler);
router.get("/analytics/revenue", revenueHandler);
router.get("/analytics/orders", ordersHandler);
router.get("/analytics/top-products", topProductsHandler);
router.get("/analytics/low-stock", lowStockHandler);

export default router;
