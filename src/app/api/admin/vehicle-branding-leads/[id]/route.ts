import { NextResponse } from "next/server";
import { requireAdminContext } from "@/server/auth/guards";
import { updateVehicleBrandingLeadSchema } from "@/modules/vehicle-branding/schemas/vehicle-branding.schema";
import {
  getVehicleBrandingLead,
  updateVehicleBrandingLead,
} from "@/modules/vehicle-branding/services/vehicle-branding.service";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  const { id } = await params;
  const lead = await getVehicleBrandingLead(id);
  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, lead });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  try {
    const { id } = await params;
    const json = await request.json();
    const parsed = updateVehicleBrandingLeadSchema
      .pick({
        status: true,
        notes: true,
        contactedAt: true,
        brandingInterest: true,
        currentSlyderStatus: true,
      })
      .safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const existing = await getVehicleBrandingLead(id);
    if (!existing) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const result = await updateVehicleBrandingLead(id, parsed.data);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("[api/admin/vehicle-branding-leads/[id]] PATCH failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Could not update lead." }, { status: 500 });
  }
}
