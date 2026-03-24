import type { ReactNode } from "react";

export function DataTable({ children }: { children: ReactNode }) {
  return (
    <div className="surface-panel overflow-hidden">
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export function TableHeaderCell({ children }: { children: ReactNode }) {
  return <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{children}</th>;
}

export function TableCell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <td className={`px-4 py-4 align-top text-sm text-slate-600 ${className}`}>{children}</td>;
}
