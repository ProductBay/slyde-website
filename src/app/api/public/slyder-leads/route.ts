import { NextResponse } from "next/server";
import { createSlyderLeadSchema } from "@/modules/leads/schemas/slyder-lead.schema";
import { createSlyderLead } from "@/modules/leads/services/slyder-lead.service";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = createSlyderLeadSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    // TODO: analytics hook — slyder_lead_submitted
    const result = await createSlyderLead(parsed.data);

    return NextResponse.json({ ok: true, leadId: result.leadId, referralCode: result.referralCode }, { status: 201 });
  } catch (error) {
    console.error("[api/public/slyder-leads] POST failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Could not save your details. Please try again." }, { status: 500 });
  }
}
