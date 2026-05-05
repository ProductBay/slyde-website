import { NextResponse } from "next/server";
import { updateSlyderLeadSchema } from "@/modules/leads/schemas/slyder-lead.schema";
import { updateSlyderLead } from "@/modules/leads/services/slyder-lead.service";
import { findLeadById } from "@/modules/leads/repositories/slyder-lead.repository";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const json = await request.json();
    const parsed = updateSlyderLeadSchema
      .pick({
        firstName: true,
        lastName: true,
        email: true,
        whatsapp: true,
        parish: true,
        vehicleType: true,
        source: true,
        referredByCode: true,
      })
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
    console.error("[api/public/slyder-leads/[id]] PATCH failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Could not update lead." }, { status: 500 });
  }
}

// Minimal public GET — returns only non-sensitive fields for prefill
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const lead = await findLeadById(id);
    if (!lead) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    // Return only safe prefill fields — no status, notes, or internal data
    return NextResponse.json({
      ok: true,
      lead: {
        firstName: lead.firstName,
        lastName: lead.lastName ?? "",
        email: lead.email,
        whatsapp: lead.whatsapp,
        parish: lead.parish ?? "",
        vehicleType: lead.vehicleType ?? "",
      },
    });
  } catch {
    return NextResponse.json({ error: "Could not fetch lead." }, { status: 500 });
  }
}
