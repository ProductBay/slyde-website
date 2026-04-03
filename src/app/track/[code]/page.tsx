import { notFound } from "next/navigation";
import { getCustomerTrackingByCode } from "@/modules/partner-carriers/services/tracking-projection.service";

type Params = { params: Promise<{ code: string }> };

export default async function CustomerTrackingPage({ params }: Params) {
  const { code } = await params;
  const detail = await getCustomerTrackingByCode(code);
  if (!detail) notFound();

  return (
    <div className="bg-[linear-gradient(180deg,#f8fbff_0%,#eef4ff_100%)]">
      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Tracking</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Track your delivery</h1>
          <p className="mt-3 text-sm text-slate-600">
            Tracking code <span className="font-semibold text-slate-950">{detail.transferPlan.customerTrackingCode}</span>
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Current status</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">{detail.customerTrackingView.overallStatusLabel}</p>
            </div>
            <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Transfer partner</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">{detail.partnerCarrier?.name ?? "SLYDE partner network"}</p>
            </div>
          </div>

          <div className="mt-8 rounded-[1.5rem] border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-950">Delivery journey</h2>
            <div className="mt-5 space-y-4">
              {detail.customerTrackingView.timeline.map((item, index) => (
                <div key={`${item.label}-${index}`} className="flex gap-4">
                  <div className="mt-1 h-3 w-3 rounded-full bg-sky-700" />
                  <div>
                    <p className="font-semibold text-slate-900">{item.label}</p>
                    <p className="text-sm text-slate-500">{new Date(item.at).toLocaleString()}</p>
                    {item.notes ? <p className="mt-1 text-sm text-slate-600">{item.notes}</p> : null}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-4 text-sm text-slate-600 md:grid-cols-2">
            <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">Delivery address</p>
              <p className="mt-2">{detail.order?.deliveryAddress ?? "Delivery address pending"}</p>
            </div>
            <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">Final fulfillment</p>
              <p className="mt-2">{detail.transferPlan.finalFulfillmentMethod.replace(/_/g, " ")}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
