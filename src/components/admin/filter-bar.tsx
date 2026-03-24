import type { ReactNode } from "react";

export function FilterBar({ children }: { children: ReactNode }) {
  return <div className="surface-card flex flex-col gap-4 p-5 lg:flex-row lg:items-end lg:justify-between">{children}</div>;
}
