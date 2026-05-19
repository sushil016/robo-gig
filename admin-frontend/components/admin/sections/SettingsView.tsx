"use client";

export function SettingsView({ apiBaseUrl, token, userLabel }: { apiBaseUrl: string; token: string; userLabel: string }) {
  return (
    <section className="grid gap-6 xl:grid-cols-2">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">Environment</p>
        <h2 className="mt-1 text-2xl font-black">API and session</h2>
        <div className="mt-5 space-y-4 text-sm font-semibold">
          <div className="rounded-md bg-slate-50 p-4">
            <p className="text-slate-500">API base URL</p>
            <p className="mt-1 font-black">{apiBaseUrl}</p>
          </div>
          <div className="rounded-md bg-slate-50 p-4">
            <p className="text-slate-500">Admin user</p>
            <p className="mt-1 font-black">{userLabel || "Not logged in"}</p>
          </div>
          <div className="rounded-md bg-slate-50 p-4">
            <p className="text-slate-500">Token</p>
            <p className="mt-1 font-black">{token ? "Stored in this browser" : "No active admin token"}</p>
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">Operating Model</p>
        <h2 className="mt-1 text-2xl font-black">Catalog source of truth</h2>
        <p className="mt-4 text-sm font-semibold leading-6 text-slate-600">
          Categories and subcategories are derived from product records. Rename and archive operations update the matching products, so the storefront category tree updates immediately from the backend.
        </p>
      </div>
    </section>
  );
}
