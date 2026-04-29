"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search, MapPin, Package } from "lucide-react";
import { getResidentialDispatchRequestsForAdmin } from "@/modules/admin/residential-management/residential-admin.repository";
import { SectionHeading } from "@/components/site/section-heading";
import type { ResidentialDispatchStatus, ResidentialPaymentStatus } from "@prisma/client";

const STATUS_CONFIG: Record<ResidentialDispatchStatus, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-800" },
  in_transit: { label: "In Transit", color: "bg-purple-100 text-purple-800" },
  picked_up: { label: "Picked Up", color: "bg-indigo-100 text-indigo-800" },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-800" },
  cancelled: { label: "Cancelled", color: "bg-slate-100 text-slate-800" },
  failed: { label: "Failed", color: "bg-red-100 text-red-800" },
};

const PAYMENT_STATUS_CONFIG: Record<ResidentialPaymentStatus, string> = {
  pending: "text-yellow-600",
  authorized: "text-blue-600",
  captured: "text-green-600",
  refunded: "text-orange-600",
  failed: "text-red-600",
};

interface DispatchRequest {
  id: string;
  referenceCode: string;
  status: ResidentialDispatchStatus;
  paymentStatus: ResidentialPaymentStatus;
  pickupParish: string;
  pickupArea: string;
  dropoffParish: string;
  dropoffArea: string;
  parcelCategory: string;
  urgency: string;
  createdAt: Date;
  lead?: {
    fullName: string;
    phone: string;
    referenceCode: string;
  };
}

export default function ResidentialDispatchRequestsPage() {
  const [requests, setRequests] = useState<DispatchRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ResidentialDispatchStatus | "all">("all");
  const [paymentFilter, setPaymentFilter] = useState<ResidentialPaymentStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getResidentialDispatchRequestsForAdmin(20, (page - 1) * 20, {
        status: statusFilter === "all" ? undefined : statusFilter,
        paymentStatus: paymentFilter === "all" ? undefined : paymentFilter,
        searchQuery: searchQuery || undefined,
      });
      setRequests(result.requests as DispatchRequest[]);
      setPagination({ total: result.total, pages: result.pages });
    } catch (error) {
      console.error("Error loading requests:", error);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, paymentFilter, searchQuery]);

  // Load on mount and when filters change
  useState(() => {
    loadRequests();
  });

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(1);
    loadRequests();
  };

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Admin Console"
        title="Residential Dispatch Requests"
        description="View and manage active Home-Slyde dispatch requests."
      />

      {/* Filters */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {/* Search */}
            <div className="relative">
              <label htmlFor="search" className="block text-sm font-medium text-slate-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input
                  id="search"
                  type="text"
                  placeholder="Reference code or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-sky-500 text-sm"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-2">
                Request Status
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as any);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-sky-500 text-sm"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_transit">In Transit</option>
                <option value="picked_up">Picked Up</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {/* Payment Filter */}
            <div>
              <label htmlFor="payment" className="block text-sm font-medium text-slate-700 mb-2">
                Payment Status
              </label>
              <select
                id="payment"
                value={paymentFilter}
                onChange={(e) => {
                  setPaymentFilter(e.target.value as any);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-sky-500 text-sm"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="authorized">Authorized</option>
                <option value="captured">Captured</option>
                <option value="refunded">Refunded</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition text-sm font-medium"
              >
                Search
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-slate-500">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="p-6 text-center text-slate-500">No requests found</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">Reference</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">Customer</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">Route</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">Parcel</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">Status</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">Payment</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">Submitted</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {requests.map((request) => {
                    const statusConfig = STATUS_CONFIG[request.status];
                    return (
                      <tr key={request.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 font-mono font-medium text-slate-900">
                          {request.referenceCode.slice(0, 8)}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          <div className="text-sm font-medium">{request.lead?.fullName}</div>
                          <div className="text-xs text-slate-500">{request.lead?.phone}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          <div className="flex items-center gap-1 text-xs">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                            <span>
                              {request.pickupArea}, {request.pickupParish}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                            →
                            <span>
                              {request.dropoffArea}, {request.dropoffParish}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600">
                          <div className="flex items-center gap-1">
                            <Package className="h-3.5 w-3.5 text-slate-400" />
                            <span>{request.parcelCategory}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1">{request.urgency}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-medium ${PAYMENT_STATUS_CONFIG[request.paymentStatus]}`}>
                            {request.paymentStatus.charAt(0).toUpperCase() + request.paymentStatus.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            href={`/admin/residential/requests/${request.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded transition"
                          >
                            View <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="border-t border-slate-200 px-6 py-4 flex items-center justify-between text-sm">
                <div className="text-slate-600">
                  Showing page {page} of {pagination.pages} ({pagination.total} total)
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 rounded border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                    disabled={page === pagination.pages}
                    className="px-3 py-1 rounded border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
