import { NextResponse } from "next/server";
import { convertSlyderLeadSchema } from "@/modules/leads/schemas/slyder-lead.schema";
import { convertSlyderLead } from "@/modules/leads/services/slyder-lead.service";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = convertSlyderLeadSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    // TODO: analytics hooks — slyder_application_started_from_lead / slyder_application_submitted_from_lead
    await convertSlyderLead(parsed.data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/public/slyder-leads/convert] POST failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Could not update lead status." }, { status: 500 });
  }
}
