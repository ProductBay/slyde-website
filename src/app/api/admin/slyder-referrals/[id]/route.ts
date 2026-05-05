import { NextResponse } from "next/server";
import { requireAdminContext } from "@/server/auth/guards";
import { updateReferralStatusSchema } from "@/modules/referrals/schemas/slyder-referral.schema";
import { findSlyderReferralById, updateSlyderReferral } from "@/modules/referrals/repositories/slyder-referral.repository";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  const { id } = await params;
  const referral = await findSlyderReferralById(id);
  if (!referral) return NextResponse.json({ error: "Not found." }, { status: 404 });

  return NextResponse.json({ ok: true, referral });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  const { id } = await params;

  try {
    const json = await request.json();
    const parsed = updateReferralStatusSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const referral = await findSlyderReferralById(id);
    if (!referral) return NextResponse.json({ error: "Not found." }, { status: 404 });

    const updated = await updateSlyderReferral(id, {
      status: parsed.data.status,
      ...(parsed.data.adminNotes ? { adminNotes: parsed.data.adminNotes } : {}),
    });

    return NextResponse.json({ ok: true, referral: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update failed.";
    console.error("[api/admin/slyder-referrals/[id]] PATCH failed", { error: message });
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
