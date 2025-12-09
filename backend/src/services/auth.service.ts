import { prisma } from "../lib/prisma.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { generateTokenPair, verifyRefreshToken, getAccessTokenExpiresIn } from "../utils/jwt.js";
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  ValidationError,
  type SignupRequest,
  type LoginRequest,
  type AuthResponse,
  type JWTPayload,
} from "../utils/types.js";
import { UserRole } from "../generated/prisma/client.js";
import { queueEmailNotification } from "./email-notification.service.js";

/**
 * Register a new user with email and password
 */
export async function signupWithEmail(data: SignupRequest): Promise<AuthResponse> {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new ConflictError("User with this email already exists");
  }

  // Hash password
  const passwordHash = await hashPassword(data.password);

  // Create user and credential in a transaction
  const user = await prisma.$transaction(async (tx) => {
    // Create user
    const newUser = await tx.user.create({
      data: {
        email: data.email,
        name: data.name ?? null,
        college: data.college ?? null,
        role: UserRole.STUDENT,
        isActive: true,
      },
    });

    // Create email credential
    await tx.emailCredential.create({
      data: {
        userId: newUser.id,
        passwordHash,
      },
    });

    return newUser;
  });

  // Create session
  const session = await createSession(user.id);

  // Generate tokens
  const tokens = generateTokenPair({
    userId: user.id,
    email: user.email,
    role: user.role,
    sessionId: session.id,
  });

  // Send welcome email (async - don't wait for it)
  queueEmailNotification(
    user.email,
    "USER_SIGNUP",
    {
      user: {
        name: user.name,
        email: user.email,
      },
    },
    user.id
  ).catch((error) => {
    console.error("Failed to queue welcome email:", error);
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl,
      college: user.college,
    },
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresIn: getAccessTokenExpiresIn(),
  };
}

/**
 * Login with email and password
 */
export async function loginWithEmail(data: LoginRequest): Promise<AuthResponse> {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email: data.email },
    include: {
      credential: true,
    },
  });

  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }

  // Check if user has email credentials
  if (!user.credential) {
    throw new UnauthorizedError("This account doesn't use email/password login");
  }

  // Verify password
  const isValidPassword = await comparePassword(
    data.password,
    user.credential.passwordHash
  );

  if (!isValidPassword) {
    throw new UnauthorizedError("Invalid email or password");
  }

  // Check if user is active
  if (!user.isActive) {
    throw new UnauthorizedError("Account has been deactivated");
  }

  // Create session
  const session = await createSession(user.id);

  // Generate tokens
  const tokens = generateTokenPair({
    userId: user.id,
    email: user.email,
    role: user.role,
    sessionId: session.id,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl,
      college: user.college,
    },
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresIn: getAccessTokenExpiresIn(),
  };
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<AuthResponse> {
  // Verify refresh token
  const decoded = verifyRefreshToken(refreshToken);

  // Find user
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  if (!user.isActive) {
    throw new UnauthorizedError("Account has been deactivated");
  }

  // Verify session if sessionId exists
  if (decoded.sessionId) {
    const session = await prisma.session.findUnique({
      where: { id: decoded.sessionId },
    });

    if (!session) {
      throw new UnauthorizedError("Session not found");
    }

    if (session.expiresAt < new Date()) {
      await prisma.session.delete({
        where: { id: session.id },
      });
      throw new UnauthorizedError("Session expired");
    }
  }

  // Create new session
  const newSession = await createSession(user.id);

  // Generate new tokens
  const tokens = generateTokenPair({
    userId: user.id,
    email: user.email,
    role: user.role,
    sessionId: newSession.id,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl,
      college: user.college,
    },
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresIn: getAccessTokenExpiresIn(),
  };
}

/**
 * Logout user by invalidating session
 */
export async function logout(userId: string, sessionId?: string): Promise<void> {
  if (sessionId) {
    await prisma.session.delete({
      where: { id: sessionId },
    }).catch(() => {
      // Session might already be deleted, ignore error
    });
  } else {
    // Delete all sessions for user
    await prisma.session.deleteMany({
      where: { userId },
    });
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatarUrl: true,
      college: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  return user;
}

/**
 * Create a new session for user
 */
async function createSession(userId: string, userAgent?: string, ipAddress?: string) {
  // Generate random session token
  const token = generateRandomToken();

  // Set expiration to 7 days
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // Create session
  const session = await prisma.session.create({
    data: {
      userId,
      token,
      userAgent: userAgent ?? null,
      ipAddress: ipAddress ?? null,
      expiresAt,
    },
  });

  // Clean up expired sessions for this user
  await prisma.session.deleteMany({
    where: {
      userId,
      expiresAt: {
        lt: new Date(),
      },
    },
  });

  return session;
}

/**
 * Generate a random token for session
 */
function generateRandomToken(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15) +
    Date.now().toString(36)
  );
}
