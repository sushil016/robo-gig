import type { ReactNode } from "react";

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <h2 className="text-lg font-semibold">{title}</h2>
      {description ? <p className="text-sm text-zinc-500">{description}</p> : null}
      {action}
    </div>
  );
}
