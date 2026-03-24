"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";

export function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");
  const isSlyderRoute = pathname.startsWith("/slyder");
  const isEmployeeRoute = pathname.startsWith("/employee-hub");
  const isDedicatedEmployeeRoute = pathname.startsWith("/employee");

  if (isAdminRoute || isSlyderRoute || isEmployeeRoute || isDedicatedEmployeeRoute) {
    return <main className="relative isolate min-h-screen">{children}</main>;
  }

  return (
    <>
      <Navbar />
      <main className="relative isolate">{children}</main>
      <Footer />
    </>
  );
}
