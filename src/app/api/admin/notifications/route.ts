import { NextResponse } from "next/server";
import { requireAdminContext } from "@/server/auth/guards";
import { listAdminNotifications } from "@/modules/admin/services/admin-control-tower.service";

export async function GET(request: Request) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  const url = new URL(request.url);
  const items = await listAdminNotifications({
    channel: url.searchParams.get("channel") ?? undefined,
    status: url.searchParams.get("status") ?? undefined,
    template: url.searchParams.get("template") ?? undefined,
    search: url.searchParams.get("search") ?? undefined,
  });
  return NextResponse.json({ items });
}
