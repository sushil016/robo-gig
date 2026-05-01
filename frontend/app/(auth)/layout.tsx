/**
 * Auth Layout
 * Simple centered layout for login/register pages
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Auth - BuildWise",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950 p-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
