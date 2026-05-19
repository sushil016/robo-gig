import { Router, type Router as RouterType } from "express";
import { authenticate, authorize } from "../../../middlewares/auth.middleware.js";
import {
  createReviewHandler,
  deleteReviewHandler,
  moderateReviewHandler,
} from "../controllers/review.controller.js";

const router: RouterType = Router();

// Authenticated users can submit and delete their own reviews
router.post("/", authenticate, createReviewHandler);
router.delete("/:id", authenticate, deleteReviewHandler);

// Admin moderation
router.patch("/admin/:id/moderate", authenticate, authorize("ADMIN"), moderateReviewHandler);

export default router;
