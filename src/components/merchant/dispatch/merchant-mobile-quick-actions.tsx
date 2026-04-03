"use client";

import { PackagePlus, Headset, Truck, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { createPortal } from "react-dom";
import { MerchantActiveDeliveriesModal } from "@/components/merchant/dashboard/merchant-active-deliveries-modal";
import { QuickDispatchForm } from "@/components/merchant/dispatch/quick-dispatch-form";
import type { DeliveryType, MerchantAddress, MerchantDeliveryStatus, OutOfParishOverallStatus, PartnerCarrier, PartnerHandoffLocation } from "@/types/backend/onboarding";

type DispatchContextResponse = {
  pickupAddresses: MerchantAddress[];
  customerAddresses: MerchantAddress[];
  partnerCarriers: PartnerCarrier[];
  partnerLocationsByCarrierId: Record<string, PartnerHandoffLocation[]>;
};

type ActiveDeliveryItem = {
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
};

export function MerchantMobileQuickActions({
  complianceRestricted,
  dispatchContext,
  activeDeliveries,
}: {
  complianceRestricted?: boolean;
  dispatchContext: DispatchContextResponse;
  activeDeliveries: ActiveDeliveryItem[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-12px_40px_rgba(15,23,42,0.12)] backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-7xl grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setOpen(true)}
            disabled={complianceRestricted}
            className="flex min-w-0 flex-col items-center justify-center gap-1 rounded-[1.2rem] bg-slate-950 px-3 py-3 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <PackagePlus className="h-4 w-4" />
            <span>Quick dispatch</span>
          </button>
          <MerchantActiveDeliveriesModal deliveries={activeDeliveries} triggerVariant="mobile" />
          <Link
            href="/merchant/support"
            className="inline-flex min-w-0 flex-col items-center justify-center gap-1 rounded-[1.2rem] border border-slate-200 bg-white px-3 py-3 text-xs font-semibold text-slate-700 shadow-soft"
            aria-label="Contact support"
          >
            <Headset className="h-5 w-5" />
            <span>Support</span>
          </Link>
        </div>
      </div>

      {open && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[120] bg-slate-950/60 backdrop-blur-sm lg:hidden">
              <div className="absolute inset-0 overflow-hidden bg-slate-100">
                <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 pb-4 pt-[max(1rem,env(safe-area-inset-top))]">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Mobile quick action</p>
                    <h2 className="mt-2 text-lg font-semibold text-slate-950">Create a dispatch fast</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600"
                    aria-label="Close quick dispatch modal"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="h-[calc(100vh-5.25rem-env(safe-area-inset-top))] overflow-y-auto px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                  {complianceRestricted ? (
                    <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
                      Merchant dispatch is restricted until the required business-license details are submitted in settings.
                    </div>
                  ) : (
                    <QuickDispatchForm
                      pickupAddresses={dispatchContext.pickupAddresses}
                      customerAddresses={dispatchContext.customerAddresses}
                      partnerCarriers={dispatchContext.partnerCarriers}
                      partnerLocationsByCarrierId={dispatchContext.partnerLocationsByCarrierId}
                      presentation="modal"
                      onSuccess={() => setOpen(false)}
                    />
                  )}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
