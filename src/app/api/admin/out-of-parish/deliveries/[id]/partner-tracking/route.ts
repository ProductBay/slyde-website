import { NextResponse } from "next/server";
import { manualPartnerTrackingSchema } from "@/modules/partner-carriers/schemas/partner-carrier.schema";
import { recordManualPartnerTrackingEvent } from "@/modules/partner-carriers/services/partner-tracking.service";
import { getAdminOutOfParishDeliveryDetail } from "@/modules/partner-carriers/services/tracking-projection.service";
import { requireAdminContext } from "@/server/auth/guards";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  const { id } = await params;
  const detail = await getAdminOutOfParishDeliveryDetail(id);
  if (!detail) {
    return NextResponse.json({ error: "Out-of-parish delivery not found" }, { status: 404 });
  }

  const json = await request.json().catch(() => null);
  const parsed = manualPartnerTrackingSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid partner tracking update" }, { status: 400 });
  }

  const actorId = "user" in adminContext ? adminContext.user.id : undefined;
  const result = await recordManualPartnerTrackingEvent({
    merchantId: detail.delivery.merchantId,
    merchantDeliveryId: detail.delivery.id,
    actorId,
    ...parsed.data,
  });

  return NextResponse.json({ ok: true, result });
}
