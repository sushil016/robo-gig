"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { LoginForm } from "@/features/auth/components/LoginForm";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

function LoginPageContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      toast.error("Authentication failed", { description: decodeURIComponent(error) });
    }
  }, [searchParams]);

  return (
    <div className="space-y-6">
      {/* Brand header */}
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex justify-center">
          <Image src="/roboroot-logo.png" alt="RoboRoot" width={160} height={44} className="h-11 w-auto" priority />
        </Link>
        <h1 className="text-xl font-black text-[#222222]">Welcome back</h1>
        <p className="text-sm text-zinc-500">Sign in to your account to continue</p>
      </div>

      <LoginForm />
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
