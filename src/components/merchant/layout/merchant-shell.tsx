import type { ReactNode } from "react";
import Link from "next/link";
import { MerchantMobileQuickActions } from "@/components/merchant/dispatch/merchant-mobile-quick-actions";
import { MerchantSidebar } from "@/components/merchant/layout/merchant-sidebar";
import type { DeliveryType, MerchantAddress, MerchantDeliveryStatus, OutOfParishOverallStatus, PartnerCarrier, PartnerHandoffLocation } from "@/types/backend/onboarding";

const mobileLinks = [
  { href: "/merchant/dashboard", label: "Dashboard" },
  { href: "/merchant/dispatch/new", label: "New Dispatch" },
  { href: "/merchant/orders", label: "Orders" },
  { href: "/merchant/deliveries", label: "Deliveries" },
  { href: "/merchant/addresses", label: "Addresses" },
  { href: "/merchant/settings", label: "Settings" },
];

export function MerchantShell({
  children,
  businessName,
  contactName,
  logoUrl,
  heroBannerUrl,
  heroBannerPosition,
  complianceRestricted,
  dispatchContext,
  activeDeliveries,
}: {
  children: ReactNode;
  businessName: string;
  contactName: string;
  logoUrl?: string;
  heroBannerUrl?: string;
  heroBannerPosition?: "left" | "center" | "right";
  complianceRestricted?: boolean;
  dispatchContext: {
    pickupAddresses: MerchantAddress[];
    customerAddresses: MerchantAddress[];
    partnerCarriers: PartnerCarrier[];
    partnerLocationsByCarrierId: Record<string, PartnerHandoffLocation[]>;
  };
  activeDeliveries: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    customerPhone?: string;
    deliveryAddress: string;
    status: MerchantDeliveryStatus;
    updatedAt: string;
    assignedAgentName: string;
    deliveryType?: DeliveryType;
    overallOutOfParishStatus?: OutOfParishOverallStatus;
  }>;
}) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]">
      <div className="flex min-h-screen">
        <MerchantSidebar businessName={businessName} logoUrl={logoUrl} />
        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
            <div
              className="border-b border-slate-200"
              style={
                heroBannerUrl
                  ? {
                      backgroundImage: `linear-gradient(135deg, rgba(15,23,42,0.76), rgba(15,23,42,0.44)), url(${heroBannerUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition:
                        heroBannerPosition === "left"
                          ? "left center"
                          : heroBannerPosition === "right"
                            ? "right center"
                            : "center center",
                    }
                  : {
                      backgroundImage:
                        "radial-gradient(circle at top left, rgba(14,165,233,0.16), transparent 30%), linear-gradient(135deg, #eff6ff 0%, #ffffff 55%, #f8fafc 100%)",
                    }
              }
            >
              <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[1.4rem] border border-white/40 bg-white/85 shadow-lg shadow-slate-900/10">
                    {logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logoUrl} alt={`${businessName} logo`} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xl font-semibold text-slate-900">{businessName.slice(0, 1).toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <p className={`text-xs font-semibold uppercase tracking-[0.28em] ${heroBannerUrl ? "text-cyan-100" : "text-slate-500"}`}>Merchant control center</p>
                    <h2 className={`mt-2 text-2xl font-semibold tracking-tight ${heroBannerUrl ? "text-white" : "text-slate-950"}`}>{businessName}</h2>
                    <p className={`mt-2 max-w-2xl text-sm ${heroBannerUrl ? "text-slate-100" : "text-slate-600"}`}>
                      Delivery operations, dispatch visibility, and support in one workspace.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className={`rounded-3xl px-5 py-3 text-sm ${heroBannerUrl ? "border border-white/20 bg-white/15 text-white backdrop-blur" : "border border-slate-200 bg-slate-50 text-slate-600"}`}>
                    <p className={`font-semibold ${heroBannerUrl ? "text-white" : "text-slate-900"}`}>{contactName}</p>
                    <p className="mt-1">Merchant workspace access</p>
                  </div>
                  <Link href="/merchant/support" className={`inline-flex rounded-full px-4 py-3 text-sm font-semibold transition ${heroBannerUrl ? "border border-white/25 bg-white/15 text-white hover:bg-white/20" : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"}`}>
                    Support
                  </Link>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto border-t border-slate-200 lg:hidden">
              <div className="mx-auto flex w-full max-w-7xl gap-3 px-4 py-3 sm:px-6">
                {mobileLinks.map((item) => (
                  <Link key={item.href} href={item.href} className="whitespace-nowrap rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </header>
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 pb-28 sm:px-6 lg:px-8 lg:pb-6">
            {complianceRestricted ? (
              <div className="mb-6 rounded-[1.5rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
                Merchant operations are restricted until COJ business-license credentials are submitted in workspace settings.
              </div>
            ) : null}
            {children}
          </main>
          <footer className="border-t border-slate-200 bg-white">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-5 text-sm text-slate-500 sm:px-6 lg:px-8">
              <p>&copy; 2026 SLYDE merchant workspace.</p>
              <p>
                Need public site access?{" "}
                <Link href="/for-businesses" className="font-semibold text-slate-800">
                  Return to For Businesses
                </Link>
              </p>
            </div>
          </footer>
        </div>
      </div>
      <MerchantMobileQuickActions complianceRestricted={complianceRestricted} dispatchContext={dispatchContext} activeDeliveries={activeDeliveries} />
    </div>
  );
}
