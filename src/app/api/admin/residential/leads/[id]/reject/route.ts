import { NextResponse } from "next/server";
import { requireAdminContext } from "@/server/auth/guards";
import { updateResidentialLeadStatus } from "@/modules/admin/residential-management/residential-admin.repository";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const reason: string = body.reason || "Rejected by admin review";

  try {
    await updateResidentialLeadStatus(id, "rejected", reason);
    return NextResponse.json({ ok: true, message: "Lead rejected successfully." });
  } catch {
    return NextResponse.json({ error: "Failed to reject lead." }, { status: 500 });
  }
}
