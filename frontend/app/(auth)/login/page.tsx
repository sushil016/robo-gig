/**
 * Login Page
 */

'use client';

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import Link from "next/link";
import { toast } from "sonner";

function LoginPageContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for OAuth error
    const error = searchParams.get('error');
    if (error) {
      toast.error('Authentication failed', {
        description: decodeURIComponent(error),
      });
    }
  }, [searchParams]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground">
          Login to your account to continue
        </p>
      </div>

      {/* Login Form */}
      <LoginForm />

      {/* Sign up link */}
      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-primary hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
