import { NextResponse } from "next/server";
import { requireAdminContext } from "@/server/auth/guards";
import { updateDispatchRequestStatus } from "@/modules/admin/residential-management/residential-admin.repository";
import type { ResidentialDispatchStatus } from "@prisma/client";

const ALLOWED: ResidentialDispatchStatus[] = ["confirmed", "rider_assigned", "picked_up", "in_transit", "delivered", "cancelled", "failed"];

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { status, failureReason } = body as { status: ResidentialDispatchStatus; failureReason?: string };

  if (!ALLOWED.includes(status)) {
    return NextResponse.json({ error: "Invalid status value." }, { status: 400 });
  }

  try {
    await updateDispatchRequestStatus(id, status, failureReason);
    return NextResponse.json({ ok: true, message: `Request status updated to ${status}.` });
  } catch {
    return NextResponse.json({ error: "Failed to update request status." }, { status: 500 });
  }
}
