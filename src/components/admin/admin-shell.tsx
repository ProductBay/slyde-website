 "use client";

import type { ReactNode } from "react";
import { useState } from "react";
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="admin-app-shell">
      <SidebarNav mobileOpen={mobileNavOpen} onNavigate={() => setMobileNavOpen(false)} onClose={() => setMobileNavOpen(false)} />
      <div className="min-w-0">
        <Topbar
          title={title}
          description={description}
          adminName={adminName}
          mode={mode}
          onMenuToggle={() => setMobileNavOpen((current) => !current)}
        />
        <div className="section-shell pb-10">{children}</div>
      </div>
    </div>
  );
}
