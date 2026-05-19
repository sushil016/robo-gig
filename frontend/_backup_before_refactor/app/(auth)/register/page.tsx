"use client";

import { RegisterForm } from "@/components/auth/RegisterForm";
import Link from "next/link";
import Image from "next/image";

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      {/* Brand header */}
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex justify-center">
          <Image src="/roboroot-logo.png" alt="RoboRoot" width={160} height={44} className="h-11 w-auto" priority />
        </Link>
        <h1 className="text-xl font-black text-[#222222]">Create your account</h1>
        <p className="text-sm text-zinc-500">Join thousands of makers building with RoboRoot</p>
      </div>

      <RegisterForm />
    </div>
  );
}
