import { NextResponse } from "next/server";
import { createVehicleBrandingLeadSchema } from "@/modules/vehicle-branding/schemas/vehicle-branding.schema";
import { createVehicleBrandingLead } from "@/modules/vehicle-branding/services/vehicle-branding.service";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = createVehicleBrandingLeadSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const result = await createVehicleBrandingLead(parsed.data);
    return NextResponse.json(
      {
        ok: true,
        leadId: result.leadId,
        duplicate: result.duplicate,
        message: "Branding interest submitted successfully.",
      },
      { status: result.duplicate ? 200 : 201 },
    );
  } catch (error) {
    console.error("[api/public/vehicle-branding-leads] POST failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Could not save your branding interest. Please try again." }, { status: 500 });
  }
}
