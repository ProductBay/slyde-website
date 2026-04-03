"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ArrowRight, PackagePlus, Truck, UserRound, X } from "lucide-react";
import { MerchantDeliveryProgressTracker } from "@/components/merchant/deliveries/merchant-delivery-progress-tracker";
import { MerchantDeliveryStatusBadge } from "@/components/merchant/deliveries/merchant-delivery-status-badge";
import { MerchantDeliveryTypeBadge } from "@/components/merchant/deliveries/merchant-delivery-type-badge";
import { OutOfParishStatusBadge } from "@/components/merchant/deliveries/out-of-parish-status-badge";
import { cn } from "@/lib/utils";
import type { DeliveryType, MerchantDeliveryStatus, OutOfParishOverallStatus } from "@/types/backend/onboarding";

type ActiveDeliveryModalItem = {
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

export function MerchantActiveDeliveriesModal({
  deliveries,
  triggerVariant = "button",
}: {
  deliveries: ActiveDeliveryModalItem[];
  triggerVariant?: "button" | "card" | "mobile";
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const trigger =
    triggerVariant === "card" ? (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-[1.75rem] border border-slate-200 bg-white p-5 text-left shadow-soft transition hover:-translate-y-0.5 hover:border-slate-300"
      >
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] bg-slate-950 text-white">
          <Truck className="h-5 w-5" />
        </div>
        <p className="mt-4 text-lg font-semibold text-slate-950">Track Active Deliveries</p>
        <p className="mt-2 text-sm text-slate-600">Open a live progress console with assigned-agent context and fast next actions.</p>
      </button>
    ) : triggerVariant === "mobile" ? (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-w-0 flex-col items-center justify-center gap-1 rounded-[1.2rem] border border-slate-200 bg-white px-3 py-3 text-xs font-semibold text-slate-700 shadow-soft"
        aria-label="Track deliveries"
      >
        <Truck className="h-5 w-5" />
        <span>Track deliveries</span>
      </button>
    ) : (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
      >
        <Truck className="h-4 w-4" />
        Track active deliveries
      </button>
    );

  return (
    <>
      {trigger}
      {typeof document !== "undefined"
        ? createPortal(
            <div
              className={cn(
                "fixed inset-0 z-[120] transition-all duration-300",
                open ? "pointer-events-auto bg-slate-950/60 opacity-100 backdrop-blur-sm" : "pointer-events-none bg-transparent opacity-0",
              )}
            >
              <div
                className={cn(
                  "absolute inset-0 flex flex-col overflow-hidden bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] transition-all duration-300 md:inset-x-0 md:bottom-0 md:top-[8vh] md:mx-auto md:max-w-6xl md:rounded-[2rem] md:border md:border-white/10 md:shadow-2xl",
                  open ? "translate-y-0 scale-100" : "translate-y-8 scale-[0.98]",
                )}
              >
                <div className="border-b border-slate-200 bg-white/90 px-5 pb-5 pt-[max(1.25rem,env(safe-area-inset-top))] backdrop-blur md:px-7 md:pt-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Active delivery console</p>
                      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Watch live merchant fulfillment</h2>
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                        See active delivery progress, assigned-agent context, and the next handoff action without leaving the dashboard.
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                        <p className="font-semibold text-slate-950">{deliveries.length}</p>
                        <p>active deliveries</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600"
                        aria-label="Close active deliveries modal"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:px-7 md:pb-5">
                  {deliveries.length ? (
                    <div className="grid gap-4 xl:grid-cols-2">
                      {deliveries.map((delivery) => {
                        const outOfParish = delivery.deliveryType === "out_of_parish";
                        return (
                          <div key={delivery.id} className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-soft">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Delivery reference</p>
                                <p className="mt-2 text-xl font-semibold text-slate-950">{delivery.orderNumber}</p>
                                <p className="mt-1 text-sm text-slate-600">{delivery.customerName}</p>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <MerchantDeliveryTypeBadge deliveryType={delivery.deliveryType ?? "in_parish"} />
                                <MerchantDeliveryStatusBadge status={delivery.status} />
                                {outOfParish && delivery.overallOutOfParishStatus ? (
                                  <OutOfParishStatusBadge status={delivery.overallOutOfParishStatus} />
                                ) : null}
                              </div>
                            </div>

                            <MerchantDeliveryProgressTracker
                              deliveryId={delivery.id}
                              status={delivery.status}
                              updatedAt={delivery.updatedAt}
                              className="mt-5 border-slate-100 bg-slate-50"
                            />

                            <div className="mt-5 grid gap-4 rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 md:grid-cols-2">
                              <p><span className="font-semibold text-slate-900">Delivery address:</span> {delivery.deliveryAddress}</p>
                              <p><span className="font-semibold text-slate-900">Assigned agent:</span> {delivery.assignedAgentName}</p>
                              <p><span className="font-semibold text-slate-900">Customer phone:</span> {delivery.customerPhone || "Pending"}</p>
                              <p><span className="font-semibold text-slate-900">Last update:</span> {new Date(delivery.updatedAt).toLocaleString()}</p>
                            </div>

                            <div className="mt-5 flex flex-wrap gap-3">
                              <Link
                                href={`/merchant/deliveries/${delivery.id}`}
                                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                              >
                                Open detail
                                <ArrowRight className="h-4 w-4" />
                              </Link>
                              {outOfParish ? (
                                <Link
                                  href={`/merchant/dispatch/new?handoffFrom=${delivery.id}&reference=${encodeURIComponent(delivery.orderNumber)}`}
                                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                                >
                                  <PackagePlus className="h-4 w-4" />
                                  Prepare second dispatch
                                </Link>
                              ) : null}
                            </div>

                            {outOfParish ? (
                              <div className="mt-4 rounded-[1.2rem] border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
                                Use a second dispatch when the package reaches the destination parish and SLYDE needs to take over the final-mile handoff.
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-8 text-center shadow-soft">
                      <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-slate-950 text-white">
                        <UserRound className="h-6 w-6" />
                      </div>
                      <h3 className="mt-4 text-xl font-semibold text-slate-950">No active deliveries right now</h3>
                      <p className="mt-2 text-sm text-slate-600">
                        Once a merchant dispatch enters the live workflow, it will appear here with its progress tracker and assigned agent context.
                      </p>
                    </div>
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
