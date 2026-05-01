"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/authStore";

export default function SettingsPage() {
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const [marketing, setMarketing] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-3xl font-black">Login to manage settings</h1>
        <Link href="/login?redirect=/settings" className="mt-6 inline-flex rounded-md bg-blue-700 px-5 py-3 text-sm font-black text-white">
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">Settings</p>
      <h1 className="mt-2 text-4xl font-black">Account preferences</h1>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-2xl font-black">Profile</h2>
          <div className="mt-5 space-y-3 text-sm font-semibold">
            <p>Name: {user?.name || "Not provided"}</p>
            <p>Email: {user?.email}</p>
            <p>Role: {user?.role}</p>
          </div>
          <Link href="/profile" className="mt-5 inline-flex rounded-md border border-slate-300 px-4 py-2 text-sm font-black">
            Open Profile
          </Link>
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-2xl font-black">Notifications</h2>
          <div className="mt-5 space-y-4">
            <label className="flex items-center justify-between rounded-md bg-slate-50 px-4 py-3 text-sm font-black">
              Order updates
              <input type="checkbox" checked={orderUpdates} onChange={(event) => setOrderUpdates(event.target.checked)} />
            </label>
            <label className="flex items-center justify-between rounded-md bg-slate-50 px-4 py-3 text-sm font-black">
              Offers and new arrivals
              <input type="checkbox" checked={marketing} onChange={(event) => setMarketing(event.target.checked)} />
            </label>
          </div>
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="text-2xl font-black">Security</h2>
          <p className="mt-2 text-sm font-semibold text-slate-500">Password changes and address book can be connected here as backend endpoints expand.</p>
          <button onClick={clearAuth} className="mt-5 rounded-md bg-slate-950 px-4 py-2 text-sm font-black text-white">Logout from this device</button>
        </section>
      </div>
    </div>
  );
}
