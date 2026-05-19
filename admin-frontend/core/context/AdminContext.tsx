"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { API_BASE_URL } from "@/config/env";

interface AdminContextValue {
  token: string;
  setToken: (t: string) => void;
  userLabel: string;
  setUserLabel: (l: string) => void;
  status: string;
  setStatus: (s: string) => void;
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;
  isAutoLogging: boolean;
  apiFetch: <T>(path: string, init?: RequestInit) => Promise<T>;
  logout: () => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string>("");
  const [userLabel, setUserLabel] = useState<string>("");
  const [status, setStatus] = useState("Ready");
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoLogging, setIsAutoLogging] = useState(true);

  function setToken(t: string) {
    setTokenState(t);
    if (t) localStorage.setItem("adminAccessToken", t);
    else localStorage.removeItem("adminAccessToken");
  }

  function logout() {
    setToken("");
    localStorage.removeItem("adminRefreshToken");
    localStorage.removeItem("adminUserLabel");
    setUserLabel("");
    setStatus("Logged out");
  }

  async function attemptCookieAuth(): Promise<boolean> {
    try {
      const refreshRes = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!refreshRes.ok) return false;

      const refreshPayload = await refreshRes.json() as {
        success: boolean;
        data?: { accessToken: string; refreshToken?: string };
      };
      if (!refreshPayload.success || !refreshPayload.data?.accessToken) return false;

      const meRes = await fetch(`${API_BASE_URL}/api/auth/me`, {
        credentials: "include",
        headers: { Authorization: `Bearer ${refreshPayload.data.accessToken}` },
      });
      if (!meRes.ok) return false;

      const mePayload = await meRes.json() as {
        success: boolean;
        data?: { name?: string; email: string; role: string };
      };
      if (!mePayload.success || !mePayload.data) return false;

      const { role, name, email } = mePayload.data;
      if (!["ADMIN", "SUPER_ADMIN"].includes(role)) return false;

      const label = name || email;
      setToken(refreshPayload.data.accessToken);
      setUserLabel(label);
      localStorage.setItem("adminUserLabel", label);
      if (refreshPayload.data.refreshToken) {
        localStorage.setItem("adminRefreshToken", refreshPayload.data.refreshToken);
      }
      setStatus("Authenticated via session");
      return true;
    } catch {
      return false;
    }
  }

  useEffect(() => {
    const savedToken = localStorage.getItem("adminAccessToken") ?? "";
    const savedUser = localStorage.getItem("adminUserLabel") ?? "";
    if (savedToken) {
      setTokenState(savedToken);
      setUserLabel(savedUser);
      setIsAutoLogging(false);
    } else {
      void attemptCookieAuth().finally(() => setIsAutoLogging(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
    const currentToken = localStorage.getItem("adminAccessToken") ?? token;

    const makeRequest = (authToken: string) =>
      fetch(`${API_BASE_URL}${path}`, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          ...(init?.headers ?? {}),
        },
      });

    let response = await makeRequest(currentToken);

    if (response.status === 401 && currentToken) {
      const storedRefreshToken = localStorage.getItem("adminRefreshToken");
      if (!storedRefreshToken) {
        logout();
        throw new Error("Session expired");
      }

      const refreshRes = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: storedRefreshToken }),
      });

      if (!refreshRes.ok) {
        logout();
        throw new Error("Session expired");
      }

      const refreshPayload = (await refreshRes.json()) as {
        data: { accessToken: string; refreshToken?: string };
      };
      const newAccessToken = refreshPayload.data.accessToken;
      const newRefreshToken = refreshPayload.data.refreshToken ?? storedRefreshToken;
      setToken(newAccessToken);
      localStorage.setItem("adminRefreshToken", newRefreshToken);
      response = await makeRequest(newAccessToken);
    }

    const payload = (await response.json().catch(() => ({}))) as T;
    if (!response.ok) {
      const err = payload as { error?: string; message?: string };
      throw new Error(err.error ?? err.message ?? `Request failed: ${response.status}`);
    }
    return payload;
  }

  return (
    <AdminContext.Provider
      value={{ token, setToken, userLabel, setUserLabel, status, setStatus, isLoading, setIsLoading, isAutoLogging, apiFetch, logout }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin(): AdminContextValue {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
