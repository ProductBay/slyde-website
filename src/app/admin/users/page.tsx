import { UserRoleCode, UserType } from "@prisma/client";
import { AdminShell } from "@/components/admin/admin-shell";
import { DataTable, TableCell, TableHeaderCell } from "@/components/admin/data-table";
import { FilterBar } from "@/components/admin/filter-bar";
import { KpiStatCard } from "@/components/admin/kpi-stat-card";
import { StatusBadge } from "@/components/admin/status-badge";
import { listAdminUsers } from "@/modules/admin/services/admin-users.service";
import { getAdminPageContext } from "@/server/admin/admin-page";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function readSingleParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return typeof value === "string" ? value : undefined;
}

export default async function AdminUsersPage({ searchParams }: { searchParams?: SearchParams }) {
  const params = (await searchParams) || {};
  const search = readSingleParam(params, "search");
  const typeCandidate = readSingleParam(params, "userType");
  const roleCandidate = readSingleParam(params, "role");
  const statusCandidate = readSingleParam(params, "status");

  const userType = typeCandidate && Object.values(UserType).includes(typeCandidate as UserType) ? (typeCandidate as UserType) : undefined;
  const role = roleCandidate && Object.values(UserRoleCode).includes(roleCandidate as UserRoleCode) ? (roleCandidate as UserRoleCode) : undefined;
  const status = statusCandidate === "enabled" || statusCandidate === "disabled" ? statusCandidate : undefined;

  const [{ user, mode }, rows] = await Promise.all([
    getAdminPageContext(),
    listAdminUsers({
      search,
      userType,
      role,
      status,
    }),
  ]);

  const enabledCount = rows.filter((item) => item.isEnabled).length;
  const disabledCount = rows.length - enabledCount;

  return (
    <AdminShell
      title="Registered Users"
      description="Monitor every account registered on the platform, including role profile, access state, and recent login/session activity."
      adminName={user.fullName}
      mode={mode}
    >
      <section className="mb-8 grid gap-4 md:grid-cols-3">
        <KpiStatCard label="Total Users" value={rows.length} />
        <KpiStatCard label="Enabled" value={enabledCount} />
        <KpiStatCard label="Disabled" value={disabledCount} />
      </section>

      <form className="mb-6" method="get">
        <FilterBar>
          <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
            <input
              className="field-input"
              name="search"
              placeholder="Search full name, email, or phone"
              defaultValue={search ?? ""}
            />
            <select className="field-input" name="userType" defaultValue={userType ?? ""}>
              <option value="">All user types</option>
              {Object.values(UserType).map((value) => (
                <option key={value} value={value}>
                  {value.replace(/_/g, " ")}
                </option>
              ))}
            </select>
            <select className="field-input" name="role" defaultValue={role ?? ""}>
              <option value="">All roles</option>
              {Object.values(UserRoleCode).map((value) => (
                <option key={value} value={value}>
                  {value.replace(/_/g, " ")}
                </option>
              ))}
            </select>
            <select className="field-input" name="status" defaultValue={status ?? ""}>
              <option value="">All account states</option>
              <option value="enabled">Enabled</option>
              <option value="disabled">Disabled</option>
            </select>
            <button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white" type="submit">
              Apply filters
            </button>
          </div>
        </FilterBar>
      </form>

      <DataTable>
        <table className="min-w-[78rem] divide-y divide-slate-200">
          <thead className="bg-slate-50/90">
            <tr>
              <TableHeaderCell>Full Name</TableHeaderCell>
              <TableHeaderCell>Email</TableHeaderCell>
              <TableHeaderCell>Phone</TableHeaderCell>
              <TableHeaderCell>User Type / Roles</TableHeaderCell>
              <TableHeaderCell>Account Status</TableHeaderCell>
              <TableHeaderCell>Signup Date</TableHeaderCell>
              <TableHeaderCell>Last Login / Session Activity</TableHeaderCell>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {rows.length ? (
              rows.map((item) => (
                <tr key={item.id}>
                  <TableCell className="font-medium text-slate-950">{item.fullName}</TableCell>
                  <TableCell>{item.email}</TableCell>
                  <TableCell>{item.phone}</TableCell>
                  <TableCell>
                    <p className="font-medium text-slate-900">{item.userType.replace(/_/g, " ")}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500">{item.roles.map((roleItem) => roleItem.replace(/_/g, " ")).join(" | ") || "none"}</p>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={item.isEnabled ? "active" : "disabled"} />
                    <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500">{item.accountStatus.replace(/_/g, " ")}</p>
                  </TableCell>
                  <TableCell>{new Date(item.createdAt).toLocaleString("en-JM")}</TableCell>
                  <TableCell>
                    <p className="text-sm text-slate-700">{item.lastActivityAt ? new Date(item.lastActivityAt).toLocaleString("en-JM") : "No activity yet"}</p>
                    <p className="mt-1 text-xs text-slate-500">Last login: {item.lastLoginAt ? new Date(item.lastLoginAt).toLocaleString("en-JM") : "Never"}</p>
                    <p className="mt-1 text-xs text-slate-500">Active sessions: {item.activeSessionCount}</p>
                  </TableCell>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-6 text-center text-sm text-slate-500" colSpan={7}>
                  No registered users match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </DataTable>
    </AdminShell>
  );
}
