import type { Request, Response } from "express";
import {
  signupWithEmail,
  loginWithEmail,
  refreshAccessToken,
  logout,
  getUserById,
} from "../services/auth.service.js";
import {
  getGoogleAuthUrl,
  handleGoogleCallback,
} from "../services/google-auth.service.js";
import {
  getGitHubAuthUrl,
  handleGitHubCallback,
} from "../services/github-auth.service.js";
import { validateSignupRequest, validateLoginRequest } from "../utils/validation.js";
import { AuthError, ValidationError } from "../utils/types.js";

/**
 * Signup with email and password
 */
export async function signupController(req: Request, res: Response): Promise<void> {
  try {
    // Validate request
    const validatedData = validateSignupRequest(req.body);

    // Create user
    const result = await signupWithEmail(validatedData);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: result,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.code,
      });
      return;
    }

    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
}

/**
 * Login with email and password
 */
export async function loginController(req: Request, res: Response): Promise<void> {
  try {
    // Validate request
    const validatedData = validateLoginRequest(req.body);

    // Authenticate user
    const result = await loginWithEmail(validatedData);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.code,
      });
      return;
    }

    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
}

/**
 * Refresh access token
 */
export async function refreshTokenController(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body as { refreshToken?: string };

    if (!refreshToken || typeof refreshToken !== "string") {
      throw new ValidationError("Refresh token is required");
    }

    const result = await refreshAccessToken(refreshToken);

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: result,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.code,
      });
      return;
    }

    console.error("Refresh token error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
}

/**
 * Logout user
 */
export async function logoutController(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const sessionId = req.user?.sessionId;

    if (!userId) {
      throw new ValidationError("User not authenticated");
    }

    await logout(userId, sessionId);

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.code,
      });
      return;
    }

    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
}

/**
 * Get current user profile
 */
export async function getMeController(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new ValidationError("User not authenticated");
    }

    const user = await getUserById(userId);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.code,
      });
      return;
    }

    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
}

/**
 * Initiate Google OAuth flow
 */
export async function googleAuthController(req: Request, res: Response): Promise<void> {
  try {
    const authUrl = getGoogleAuthUrl();
    res.redirect(authUrl);
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.code,
      });
      return;
    }

    console.error("Google auth error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
}

/**
 * Handle Google OAuth callback
 */
export async function googleCallbackController(req: Request, res: Response): Promise<void> {
  try {
    const { code } = req.query as { code?: string };

    if (!code) {
      throw new ValidationError("Authorization code is required");
    }

    const result = await handleGoogleCallback(code);

    // Redirect to frontend with tokens
    // In production, use environment variable for frontend URL
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const redirectUrl = `${frontendUrl}/callback?provider=google&accessToken=${result.accessToken}&refreshToken=${result.refreshToken}`;
    
    res.redirect(redirectUrl);
  } catch (error) {
    if (error instanceof AuthError) {
      // Redirect to frontend with error
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(error.message)}`);
      return;
    }

    console.error("Google callback error:", error);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    res.redirect(`${frontendUrl}/login?error=authentication_failed`);
  }
}

/**
 * Initiate GitHub OAuth flow
 */
export async function githubAuthController(req: Request, res: Response): Promise<void> {
  try {
    const authUrl = getGitHubAuthUrl();
    res.redirect(authUrl);
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.code,
      });
      return;
    }

    console.error("GitHub auth error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
}

/**
 * Handle GitHub OAuth callback
 */
export async function githubCallbackController(req: Request, res: Response): Promise<void> {
  try {
    const { code } = req.query as { code?: string };

    if (!code) {
      throw new ValidationError("Authorization code is required");
    }

    const result = await handleGitHubCallback(code);

    // Redirect to frontend with tokens
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const redirectUrl = `${frontendUrl}/callback?provider=github&accessToken=${result.accessToken}&refreshToken=${result.refreshToken}`;
    
    res.redirect(redirectUrl);
  } catch (error) {
    if (error instanceof AuthError) {
      // Redirect to frontend with error
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(error.message)}`);
      return;
    }

    console.error("GitHub callback error:", error);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    res.redirect(`${frontendUrl}/login?error=authentication_failed`);
  }
}