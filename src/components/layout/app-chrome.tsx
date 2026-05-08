"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Footer } from "@/components/site/footer";
import { FloatingSupportButton } from "@/components/site/floating-support-button";
import { FloatingWhatsAppCta } from "@/components/site/floating-whatsapp-cta";
import { Navbar } from "@/components/site/navbar";

export function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");
  const isSlyderRoute = pathname.startsWith("/slyder");
  const isEmployeeRoute = pathname.startsWith("/employee-hub");
  const isDedicatedEmployeeRoute = pathname.startsWith("/employee");
  const isMerchantRoute = pathname.startsWith("/merchant");
  const shouldHideWhatsAppCta =
    pathname.startsWith("/api") ||
    pathname.startsWith("/success") ||
    pathname.includes("/success") ||
    pathname.includes("/login");

  if (isAdminRoute || isSlyderRoute || isEmployeeRoute || isDedicatedEmployeeRoute || isMerchantRoute) {
    return <main className="relative isolate min-h-screen">{children}</main>;
  }

  return (
    <>
      <Navbar />
      <main className="relative isolate">{children}</main>
      <Footer />
      <FloatingSupportButton />
      {!shouldHideWhatsAppCta ? <FloatingWhatsAppCta /> : null}
    </>
  );
}
