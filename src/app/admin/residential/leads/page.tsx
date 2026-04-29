"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { getResidentialLeadsForAdmin } from "@/modules/admin/residential-management/residential-admin.repository";
import { SectionHeading } from "@/components/site/section-heading";
import { LinkButton } from "@/components/ui/link-button";
import type { ResidentialIntakeStatus } from "@prisma/client";

const STATUS_CONFIG: Record<ResidentialIntakeStatus, { label: string; color: string }> = {
  submitted: { label: "Submitted", color: "bg-blue-100 text-blue-800" },
  approved: { label: "Approved", color: "bg-green-100 text-green-800" },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-800" },
};

interface ResidentialLead {
  id: string;
  referenceCode: string;
  fullName: string;
  phone: string;
  email?: string;
  parish: string;
  area: string;
  status: ResidentialIntakeStatus;
  createdAt: Date;
  dispatchRequest?: {
    id: string;
    status: string;
    createdAt: Date;
  };
}

export default function ResidentialLeadsPage() {
  const [leads, setLeads] = useState<ResidentialLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ResidentialIntakeStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const loadLeads = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getResidentialLeadsForAdmin(20, (page - 1) * 20, {
        status: statusFilter === "all" ? undefined : statusFilter,
        searchQuery: searchQuery || undefined,
      });
      setLeads(result.leads as ResidentialLead[]);
      setPagination({ total: result.total, pages: result.pages });
    } catch (error) {
      console.error("Error loading leads:", error);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, searchQuery]);

  // Load leads on component mount and when filters change
  useState(() => {
    loadLeads();
  });

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(1);
    loadLeads();
  };

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Admin Console"
        title="Residential Dispatch Leads"
        description="View and manage new resident signups for Home-Slyde dispatch."
      />

      {/* Filters */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                  placeholder="Name, phone, email, or reference code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-sky-500 text-sm"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-2">
                Status
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
                <option value="all">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
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
          <div className="p-6 text-center text-slate-500">Loading leads...</div>
        ) : leads.length === 0 ? (
          <div className="p-6 text-center text-slate-500">No leads found</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">Name</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">Contact</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">Location</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">Status</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">Dispatch Request</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">Signed Up</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {leads.map((lead) => {
                    const statusConfig = STATUS_CONFIG[lead.status];
                    return (
                      <tr key={lead.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 font-medium text-slate-900">{lead.fullName}</td>
                        <td className="px-6 py-4 text-slate-600">
                          <div className="text-xs">{lead.phone}</div>
                          {lead.email && <div className="text-xs text-slate-500">{lead.email}</div>}
                        </td>
                        <td className="px-6 py-4 text-slate-600 text-xs">
                          {lead.area}, {lead.parish}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600">
                          {lead.dispatchRequest ? (
                            <span className="font-mono text-sky-600">{lead.dispatchRequest.id.slice(0, 8)}</span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            href={`/admin/residential/leads/${lead.id}`}
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
