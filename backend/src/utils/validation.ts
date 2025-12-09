import type { SignupRequest, LoginRequest } from "./types.js";
import { ValidationError } from "./types.js";

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate signup request
 */
export function validateSignupRequest(data: unknown): SignupRequest {
  if (typeof data !== "object" || data === null) {
    throw new ValidationError("Invalid request body");
  }

  const { email, password, name, college } = data as Record<string, unknown>;

  if (!email || typeof email !== "string") {
    throw new ValidationError("Email is required and must be a string");
  }

  if (!isValidEmail(email)) {
    throw new ValidationError("Invalid email format");
  }

  if (!password || typeof password !== "string") {
    throw new ValidationError("Password is required and must be a string");
  }

  if (password.length < 8) {
    throw new ValidationError("Password must be at least 8 characters long");
  }

  if (name !== undefined && typeof name !== "string") {
    throw new ValidationError("Name must be a string");
  }

  if (college !== undefined && typeof college !== "string") {
    throw new ValidationError("College must be a string");
  }

  const result: SignupRequest = {
    email: email.toLowerCase().trim(),
    password,
  };

  if (name && typeof name === "string") {
    result.name = name;
  }

  if (college && typeof college === "string") {
    result.college = college;
  }

  return result;
}

/**
 * Validate login request
 */
export function validateLoginRequest(data: unknown): LoginRequest {
  if (typeof data !== "object" || data === null) {
    throw new ValidationError("Invalid request body");
  }

  const { email, password } = data as Record<string, unknown>;

  if (!email || typeof email !== "string") {
    throw new ValidationError("Email is required and must be a string");
  }

  if (!isValidEmail(email)) {
    throw new ValidationError("Invalid email format");
  }

  if (!password || typeof password !== "string") {
    throw new ValidationError("Password is required and must be a string");
  }

  return {
    email: email.toLowerCase().trim(),
    password,
  };
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove < and >
    .trim();
}
