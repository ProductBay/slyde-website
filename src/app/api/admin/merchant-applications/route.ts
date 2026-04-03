import { NextResponse } from "next/server";
import { requireAdminContext } from "@/server/auth/guards";
import { merchantApplicationFiltersSchema } from "@/modules/merchant/schemas/merchant-application.schema";
import { listMerchantApplicationRows } from "@/modules/merchant/services/merchant-application.service";

export async function GET(request: Request) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  const url = new URL(request.url);
  const parsed = merchantApplicationFiltersSchema.safeParse({
    approvalStatus: url.searchParams.get("approvalStatus") ?? undefined,
    activationStatus: url.searchParams.get("activationStatus") ?? undefined,
    onboardingTrack: url.searchParams.get("onboardingTrack") ?? undefined,
    parish: url.searchParams.get("parish") ?? undefined,
    assignedAdminId: url.searchParams.get("assignedAdminId") ?? undefined,
    search: url.searchParams.get("search") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const rows = await listMerchantApplicationRows(parsed.data);
  return NextResponse.json({ rows });
}
