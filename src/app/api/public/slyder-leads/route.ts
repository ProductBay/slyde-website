import { NextResponse } from "next/server";
import { createSlyderLeadSchema } from "@/modules/leads/schemas/slyder-lead.schema";
import { createSlyderLead } from "@/modules/leads/services/slyder-lead.service";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const parsed = createSlyderLeadSchema.safeParse({
      ...json,
      agreementIpAddress: forwardedFor || request.headers.get("x-real-ip") || undefined,
      agreementUserAgent: request.headers.get("user-agent") || undefined,
    });

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    // TODO: analytics hook — slyder_lead_submitted
    const result = await createSlyderLead(parsed.data);

    if (result.duplicate) {
      return NextResponse.json(
        { ok: true, leadId: result.leadId, referralCode: result.referralCode, duplicate: true },
        { status: 200 },
      );
    }

    return NextResponse.json({ ok: true, leadId: result.leadId, referralCode: result.referralCode }, { status: 201 });
  } catch (error) {
    console.error("[api/public/slyder-leads] POST failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Could not save your details. Please try again." }, { status: 500 });
  }
}
