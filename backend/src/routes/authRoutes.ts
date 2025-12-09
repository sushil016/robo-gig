import { Router } from "express";
import {
  signupController,
  loginController,
  refreshTokenController,
  logoutController,
  getMeController,
  googleAuthController,
  googleCallbackController,
  githubAuthController,
  githubCallbackController,
} from "../controller/auth.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router: Router = Router();

// Email/Password Authentication
router.post("/signup", signupController);
router.post("/login", loginController);

// Token Management
router.post("/refresh", refreshTokenController);
router.post("/logout", authenticate, logoutController);

// User Profile
router.get("/me", authenticate, getMeController);

// Google OAuth
router.get("/google", googleAuthController);
router.get("/google/callback", googleCallbackController);

// GitHub OAuth
router.get("/github", githubAuthController);
router.get("/github/callback", githubCallbackController);

export default router;
