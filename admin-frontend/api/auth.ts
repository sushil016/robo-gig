import { apiFetch } from "./client";
import type { LoginResponse } from "@/types";

export async function adminLogin(email: string, password: string): Promise<LoginResponse["data"]> {
  const payload = await apiFetch<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (!["ADMIN", "SUPER_ADMIN"].includes(payload.data.user.role)) {
    throw new Error("This account is not an admin.");
  }

  return payload.data;
}
