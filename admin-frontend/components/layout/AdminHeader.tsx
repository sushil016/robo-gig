"use client";

export function AdminHeader({
  activeSection,
  status,
  isLoading,
  userLabel,
  hasToken,
  onRefresh,
  onLogout,
  onOpenSidebar,
}: {
  activeSection: string;
  status: string;
  isLoading: boolean;
  userLabel: string;
  hasToken: boolean;
  onRefresh: () => void;
  onLogout: () => void;
  onOpenSidebar: () => void;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex min-h-20 flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center gap-3">
          <button
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-black lg:hidden"
            onClick={onOpenSidebar}
          >
            Menu
          </button>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">{activeSection}</p>
            <h2 className="text-2xl font-black">Dashboard & Control Panel</h2>
            <p className="text-sm font-semibold text-slate-500">{status}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={onRefresh} className="admin-action bg-white" disabled={isLoading}>
            {isLoading ? "Loading..." : "Refresh"}
          </button>
          {hasToken ? (
            <button onClick={onLogout} className="rounded-md bg-slate-950 px-4 py-2 text-sm font-black text-white">
              Logout {userLabel}
            </button>
          ) : (
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">
              Login required for edits
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
