import Link from "next/link";
import type { AdminReferralFilters } from "@/types/backend/onboarding";
import type { ReferralRewardWithReferral } from "@/server/persistence/repository";
import { DataTable, TableCell, TableHeaderCell } from "@/components/admin/data-table";
import { ReferralStatusBadge } from "@/components/admin/referrals/referral-status-badge";

export function ReferralsTable({
  rows,
  filters,
}: {
  rows: ReferralRewardWithReferral[];
  filters?: AdminReferralFilters;
}) {
  return (
    <>
      <form className="mb-6" method="get">
        <div className="surface-panel flex flex-col gap-4 p-4 lg:flex-row lg:items-center">
          <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
            <input className="field-input" name="search" placeholder="Search name, code, phone" defaultValue={filters?.search || ""} />
            <input className="field-input" name="parish" placeholder="Parish" defaultValue={filters?.parish || ""} />
            <input className="field-input" type="date" name="dateFrom" defaultValue={filters?.dateFrom || ""} />
            <input className="field-input" type="date" name="dateTo" defaultValue={filters?.dateTo || ""} />
            <select className="field-input" name="status" defaultValue={filters?.status || ""}>
              <option value="">All referral statuses</option>
              <option value="submitted">Submitted</option>
              <option value="duplicate_flagged">Duplicate flagged</option>
              <option value="application_completed">Application completed</option>
              <option value="approved">Approved</option>
              <option value="activated">Activated</option>
              <option value="ready">Ready</option>
              <option value="reward_earned">Reward earned</option>
              <option value="disqualified">Disqualified</option>
            </select>
            <select className="field-input" name="rewardStatus" defaultValue={filters?.rewardStatus || ""}>
              <option value="">All reward states</option>
              <option value="earned">Earned</option>
              <option value="claimed_by_referrer">Claimed</option>
              <option value="gifted">Gifted</option>
              <option value="redeemed">Redeemed</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white" type="submit">Apply filters</button>
        </div>
      </form>

      <DataTable>
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50/90">
            <tr>
              <TableHeaderCell>Referral</TableHeaderCell>
              <TableHeaderCell>Referrer</TableHeaderCell>
              <TableHeaderCell>Referred Driver</TableHeaderCell>
              <TableHeaderCell>Parish</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Reward</TableHeaderCell>
              <TableHeaderCell>Created</TableHeaderCell>
              <TableHeaderCell>Action</TableHeaderCell>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {rows.map(({ referral, reward }) => (
              <tr key={referral.id}>
                <TableCell className="font-medium text-slate-950">{referral.referralCode}</TableCell>
                <TableCell>
                  <div>{referral.referrerName}</div>
                  <div className="text-xs text-slate-500">{referral.referrerPhone}</div>
                </TableCell>
                <TableCell>
                  <div>{referral.referredName}</div>
                  <div className="text-xs text-slate-500">{referral.referredPhone}</div>
                </TableCell>
                <TableCell>{referral.referredParish || "Unspecified"}</TableCell>
                <TableCell><ReferralStatusBadge status={referral.status} /></TableCell>
                <TableCell>{reward ? <ReferralStatusBadge status={reward.status} /> : <span className="text-xs text-slate-500">No reward yet</span>}</TableCell>
                <TableCell>{new Date(referral.createdAt).toLocaleDateString("en-JM")}</TableCell>
                <TableCell>
                  <Link href={`/admin/referrals/${referral.id}`} className="text-sm font-semibold text-sky-700">View referral</Link>
                </TableCell>
              </tr>
            ))}
          </tbody>
        </table>
      </DataTable>
    </>
  );
}
