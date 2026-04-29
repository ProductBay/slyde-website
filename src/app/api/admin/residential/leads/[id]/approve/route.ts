import { NextResponse } from "next/server";
import { requireAdminContext } from "@/server/auth/guards";
import { updateResidentialLeadStatus } from "@/modules/admin/residential-management/residential-admin.repository";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  const { id } = await params;

  try {
    await updateResidentialLeadStatus(id, "approved");
    return NextResponse.json({ ok: true, message: "Lead approved successfully." });
  } catch {
    return NextResponse.json({ error: "Failed to approve lead." }, { status: 500 });
  }
}
