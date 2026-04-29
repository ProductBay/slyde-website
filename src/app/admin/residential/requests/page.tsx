import Link from "next/link";
import { ArrowRight, MapPin, Package } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminPageContext } from "@/server/admin/admin-page";
import { getResidentialDispatchRequestsForAdmin } from "@/modules/admin/residential-management/residential-admin.repository";
import type { ResidentialDispatchStatus, ResidentialPaymentStatus } from "@prisma/client";

const STATUS_CONFIG: Record<ResidentialDispatchStatus, { label: string; color: string }> = {
  submitted:      { label: "Submitted",     color: "bg-yellow-100 text-yellow-800" },
  payment_pending:{ label: "Pmt Pending",   color: "bg-orange-100 text-orange-800" },
  confirmed:      { label: "Confirmed",     color: "bg-blue-100 text-blue-800" },
  rider_assigned: { label: "Rider Assigned",color: "bg-indigo-100 text-indigo-800" },
  picked_up:      { label: "Picked Up",     color: "bg-purple-100 text-purple-800" },
  in_transit:     { label: "In Transit",    color: "bg-sky-100 text-sky-800" },
  delivered:      { label: "Delivered",     color: "bg-green-100 text-green-800" },
  cancelled:      { label: "Cancelled",     color: "bg-slate-100 text-slate-600" },
  failed:         { label: "Failed",        color: "bg-red-100 text-red-800" },
};

const PAYMENT_CONFIG: Record<ResidentialPaymentStatus, string> = {
  pending:    "text-yellow-600",
  authorized: "text-blue-600",
  captured:   "text-green-600",
  failed:     "text-red-600",
  refunded:   "text-orange-600",
  cancelled:  "text-slate-500",
};

export default async function ResidentialDispatchRequestsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) || {};
  const search = typeof params.search === "string" ? params.search : undefined;
  const status = typeof params.status === "string" ? (params.status as ResidentialDispatchStatus) : undefined;
  const paymentStatus = typeof params.payment === "string" ? (params.payment as ResidentialPaymentStatus) : undefined;
  const page = typeof params.page === "string" ? Math.max(1, parseInt(params.page, 10) || 1) : 1;
  const limit = 20;
  const offset = (page - 1) * limit;

  const [{ user, mode }, result] = await Promise.all([
    getAdminPageContext(),
    getResidentialDispatchRequestsForAdmin(limit, offset, {
      status,
      paymentStatus,
      searchQuery: search,
    }),
  ]);

  const { requests, total, pages } = result;

  return (
    <AdminShell title="Dispatch Requests" adminName={user.fullName} mode={mode}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Residential Dispatch Requests</h1>
          <p className="text-sm text-slate-500 mt-1">View and manage Home-Slyde dispatch requests.</p>
        </div>

        {/* Filters */}
        <form method="GET" className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div>
              <label htmlFor="search" className="block text-xs font-medium text-slate-600 mb-1">Search</label>
              <input
                id="search"
                name="search"
                type="text"
                defaultValue={search ?? ""}
                placeholder="Reference or address..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label htmlFor="status" className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <select
                id="status"
                name="status"
                defaultValue={status ?? ""}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-sky-500"
              >
                <option value="">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="payment_pending">Payment Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="rider_assigned">Rider Assigned</option>
                <option value="picked_up">Picked Up</option>
                <option value="in_transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div>
              <label htmlFor="payment" className="block text-xs font-medium text-slate-600 mb-1">Payment</label>
              <select
                id="payment"
                name="payment"
                defaultValue={paymentStatus ?? ""}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-sky-500"
              >
                <option value="">All Payments</option>
                <option value="pending">Pending</option>
                <option value="authorized">Authorized</option>
                <option value="captured">Captured</option>
                <option value="refunded">Refunded</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition text-sm font-medium"
              >
                Filter
              </button>
            </div>
          </div>
        </form>

        {/* Table */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
          {requests.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">No requests found.</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold text-slate-700">Reference</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-700">Customer</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-700">Route</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-700">Parcel</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-700">Status</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-700">Payment</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-700">Submitted</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-700"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {requests.map((req) => {
                      const sc = STATUS_CONFIG[req.status];
                      return (
                        <tr key={req.id} className="hover:bg-slate-50 transition">
                          <td className="px-6 py-4 font-mono text-xs text-slate-900">{req.referenceCode.slice(0, 10)}</td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-slate-900">{req.lead?.fullName ?? "—"}</div>
                            <div className="text-xs text-slate-500">{req.lead?.phone}</div>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-600">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-slate-400" />
                              {req.pickupArea}, {req.pickupParish}
                            </div>
                            <div className="text-slate-400 mt-0.5 pl-4">→ {req.dropoffArea}, {req.dropoffParish}</div>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-600">
                            <div className="flex items-center gap-1">
                              <Package className="h-3 w-3 text-slate-400" />
                              {req.parcelCategory.replace(/_/g, " ")}
                            </div>
                            <div className="text-slate-400 mt-0.5">{req.urgency}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${sc.color}`}>
                              {sc.label}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-xs font-medium ${PAYMENT_CONFIG[req.paymentStatus]}`}>
                              {req.paymentStatus.replace(/_/g, " ")}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-500">
                            {new Date(req.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <Link
                              href={`/admin/residential/requests/${req.id}`}
                              className="inline-flex items-center gap-1 text-xs font-medium text-sky-600 hover:text-sky-700"
                            >
                              View <ArrowRight className="h-3 w-3" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="border-t border-slate-200 px-6 py-4 flex items-center justify-between text-sm text-slate-600">
                  <span>Page {page} of {pages} ({total} total)</span>
                  <div className="flex gap-2">
                    {page > 1 && (
                      <Link
                        href={`?${new URLSearchParams({ ...(search ? { search } : {}), ...(status ? { status } : {}), ...(paymentStatus ? { payment: paymentStatus } : {}), page: String(page - 1) }).toString()}`}
                        className="px-3 py-1 rounded border border-slate-300 hover:bg-slate-50 text-xs"
                      >
                        Previous
                      </Link>
                    )}
                    {page < pages && (
                      <Link
                        href={`?${new URLSearchParams({ ...(search ? { search } : {}), ...(status ? { status } : {}), ...(paymentStatus ? { payment: paymentStatus } : {}), page: String(page + 1) }).toString()}`}
                        className="px-3 py-1 rounded border border-slate-300 hover:bg-slate-50 text-xs"
                      >
                        Next
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
