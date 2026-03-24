import type { ReactNode } from "react";
import { SidebarNav } from "@/components/admin/sidebar-nav";
import { Topbar } from "@/components/admin/topbar";

export function AdminShell({
  children,
  title,
  description,
  adminName,
  mode,
}: {
  children: ReactNode;
  title: string;
  description?: string;
  adminName: string;
  mode: "authenticated" | "development";
}) {
  return (
    <div className="admin-app-shell">
      <SidebarNav />
      <div className="min-w-0">
        <Topbar title={title} description={description} adminName={adminName} mode={mode} />
        <div className="section-shell pb-10">{children}</div>
      </div>
    </div>
  );
}
