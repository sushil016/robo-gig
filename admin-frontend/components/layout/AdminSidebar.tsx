"use client";

import type { AdminSection } from "@/types";
import { sectionItems } from "@/config/navigation";
import { STOREFRONT_URL } from "@/config/env";

export function AdminSidebar({
  activeSection,
  isOpen,
  onSelect,
  onClose,
}: {
  activeSection: AdminSection;
  isOpen: boolean;
  onSelect: (section: AdminSection) => void;
  onClose: () => void;
}) {
  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-slate-200 bg-slate-950 text-white transition lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-white/10 p-6">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">RoboRoot</p>
            <h1 className="mt-2 text-2xl font-black">Admin Console</h1>
            <p className="mt-2 text-sm font-semibold text-slate-400">
              Products, projects, media, catalog structure.
            </p>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            {sectionItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onSelect(item.id as AdminSection);
                  onClose();
                }}
                className={`flex w-full items-center gap-3 rounded-md px-4 py-3 text-left text-sm font-black transition ${
                  activeSection === item.id
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white/10 text-xs">
                  {item.icon}
                </span>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="border-t border-white/10 p-4">
            <a
              href={STOREFRONT_URL}
              className="block rounded-md bg-white px-4 py-3 text-center text-sm font-black text-slate-950"
            >
              Open Storefront
            </a>
          </div>
        </div>
      </aside>

      {isOpen && (
        <button
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
          onClick={onClose}
        />
      )}
    </>
  );
}
