import { API_BASE_URL } from "@/config/env";

export type ApiFetchOptions = RequestInit & { token?: string };

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { token, ...init } = options;

  const makeRequest = (authToken: string) =>
    fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...(init.headers ?? {}),
      },
    });

  let response = await makeRequest(token ?? "");

  if (response.status === 401 && token) {
    const storedRefreshToken =
      typeof window !== "undefined" ? localStorage.getItem("adminRefreshToken") : null;

    if (!storedRefreshToken) throw new Error("Session expired");

    const refreshRes = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: storedRefreshToken }),
    });

    if (!refreshRes.ok) throw new Error("Session expired");

    const refreshPayload = (await refreshRes.json()) as {
      data: { accessToken: string; refreshToken?: string };
    };
    const newAccessToken = refreshPayload.data.accessToken;
    const newRefreshToken = refreshPayload.data.refreshToken ?? storedRefreshToken;

    if (typeof window !== "undefined") {
      localStorage.setItem("adminAccessToken", newAccessToken);
      localStorage.setItem("adminRefreshToken", newRefreshToken);
    }

    response = await makeRequest(newAccessToken);
  }

  const payload = (await response.json().catch(() => ({}))) as T;
  if (!response.ok) {
    const err = payload as { error?: string; message?: string };
    throw new Error(err.error ?? err.message ?? `Request failed: ${response.status}`);
  }
  return payload;
}
