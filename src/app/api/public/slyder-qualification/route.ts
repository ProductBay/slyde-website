import { NextResponse } from "next/server";
import { createSlyderQualificationSchema } from "@/modules/leads/schemas/slyder-qualification.schema";
import { qualifySlyderLead } from "@/modules/leads/services/slyder-lead.service";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = createSlyderQualificationSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    // TODO: analytics hook — slyder_qualification_submitted
    const result = await qualifySlyderLead(parsed.data);

    return NextResponse.json({
      ok: true,
      status: result.status,
      qualificationScore: result.qualificationScore,
      nextUrl: result.nextUrl,
    });
  } catch (error) {
    console.error("[api/public/slyder-qualification] POST failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Could not save qualification. Please try again." }, { status: 500 });
  }
}
