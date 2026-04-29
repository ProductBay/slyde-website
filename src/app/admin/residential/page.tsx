"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Users, Package, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";
import { getResidentialStats } from "@/modules/admin/residential-management/residential-admin.repository";
import { SectionHeading } from "@/components/site/section-heading";
import { AnimatedCount } from "@/components/site/animated-count";

export default function ResidentialAdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getResidentialStats();
        setStats(data);
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const StatCard = ({
    icon: Icon,
    label,
    value,
    change,
    color,
  }: {
    icon: any;
    label: string;
    value: number | string;
    change?: string;
    color: string;
  }) => (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-600">{label}</h3>
        <div className={`p-2.5 rounded-lg ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold text-slate-900">{value}</p>
        {change && <p className="text-sm text-green-600 font-medium">{change}</p>}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Admin Console"
        title="Home-Slyde Residential Dispatch"
        description="Complete control and visibility over residential pickup and delivery requests."
      />

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-lg border border-slate-200 bg-white p-6 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-24 mb-4" />
              <div className="h-8 bg-slate-200 rounded w-16" />
            </div>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            icon={Users}
            label="Total Residents"
            value={stats.totalLeads}
            color="bg-blue-100 text-blue-600"
          />
          <StatCard
            icon={Users}
            label="New (30 days)"
            value={stats.activeLeads}
            color="bg-green-100 text-green-600"
          />
          <StatCard
            icon={Package}
            label="Total Requests"
            value={stats.totalRequests}
            color="bg-purple-100 text-purple-600"
          />
          <StatCard
            icon={AlertCircle}
            label="Pending Requests"
            value={stats.pendingRequests}
            color="bg-yellow-100 text-yellow-600"
          />
          <StatCard
            icon={CheckCircle}
            label="Completed"
            value={stats.completedRequests}
            color="bg-green-100 text-green-600"
          />
          <StatCard
            icon={TrendingUp}
            label="Success Rate"
            value={`${stats.successRate}%`}
            color="bg-emerald-100 text-emerald-600"
          />
        </div>
      ) : null}

      {/* Quick Actions */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/admin/residential/leads"
            className="flex items-center justify-between p-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition"
          >
            <div>
              <p className="font-medium text-slate-900">View All Leads</p>
              <p className="text-sm text-slate-600">Manage resident signups</p>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400" />
          </Link>

          <Link
            href="/admin/residential/requests"
            className="flex items-center justify-between p-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition"
          >
            <div>
              <p className="font-medium text-slate-900">View All Requests</p>
              <p className="text-sm text-slate-600">Monitor dispatch requests</p>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Leads Management */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Leads Management</h3>
          <div className="space-y-3 text-sm">
            <p className="text-slate-600">
              View all resident signups and manage their application status (submitted, approved, rejected).
            </p>
            <ul className="space-y-2 text-slate-600 ml-4">
              <li>• Search by name, phone, email, or reference code</li>
              <li>• Filter by application status</li>
              <li>• Approve or reject applications with comments</li>
              <li>• Track dispatch intent and handoff status</li>
            </ul>
            <Link
              href="/admin/residential/leads"
              className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-700 font-medium mt-4"
            >
              Manage Leads <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Requests Management */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Requests Management</h3>
          <div className="space-y-3 text-sm">
            <p className="text-slate-600">
              Monitor and control dispatch requests from submission through delivery.
            </p>
            <ul className="space-y-2 text-slate-600 ml-4">
              <li>• Track request lifecycle (pending → confirmed → delivered)</li>
              <li>• Search and filter by status or payment status</li>
              <li>• Update request status manually</li>
              <li>• View complete route and parcel details</li>
              <li>• Access payment and timeline information</li>
            </ul>
            <Link
              href="/admin/residential/requests"
              className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-700 font-medium mt-4"
            >
              Manage Requests <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Workflow Info */}
      <div className="rounded-lg border border-slate-200 bg-blue-50 p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Admin Workflow Guide</h3>
        <div className="space-y-4 text-sm text-blue-900">
          <div>
            <p className="font-semibold mb-2">1. New Lead Signup</p>
            <p>Residents sign up via /dispatch-from-home. New leads appear in "Leads" with status "submitted".</p>
          </div>
          <div>
            <p className="font-semibold mb-2">2. Review & Approve</p>
            <p>Review lead details (location, contact info, intent). Approve to enable dispatch, or reject with reason.</p>
          </div>
          <div>
            <p className="font-semibold mb-2">3. Submit Dispatch Request</p>
            <p>Approved residents can submit dispatch requests. Requests start with status "pending".</p>
          </div>
          <div>
            <p className="font-semibold mb-2">4. Manage Request Lifecycle</p>
            <p>
              As requests progress, update status: confirm → pick up → deliver. Track payment and timeline events.
            </p>
          </div>
          <div>
            <p className="font-semibold mb-2">5. Handle Issues</p>
            <p>Cancel or mark as failed with detailed reasons for audit and customer communication.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
