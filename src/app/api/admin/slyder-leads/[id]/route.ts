import { NextResponse } from "next/server";
import { requireAdminContext } from "@/server/auth/guards";
import { updateSlyderLeadSchema } from "@/modules/leads/schemas/slyder-lead.schema";
import { updateSlyderLead } from "@/modules/leads/services/slyder-lead.service";
import { findLeadById } from "@/modules/leads/repositories/slyder-lead.repository";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  try {
    const { id } = await params;
    const json = await request.json();

    // Admin can update status, notes, lastContactedAt
    const parsed = updateSlyderLeadSchema
      .pick({ status: true, qualificationNotes: true, lastContactedAt: true })
      .safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const existing = await findLeadById(id);
    if (!existing) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const result = await updateSlyderLead(id, parsed.data);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("[api/admin/slyder-leads/[id]] PATCH failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Could not update lead." }, { status: 500 });
  }
}
