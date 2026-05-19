"use client";

import type { ReactNode } from "react";
import { QueryProvider } from "@/providers/QueryProvider";

export function AppProvider({ children }: { children: ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>;
}
