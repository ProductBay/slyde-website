import { NextResponse } from "next/server";
import { merchantLocationUpdateSchema } from "@/modules/merchant-ops/schemas/merchant-live-tracking.schema";
import { recordMerchantDeliveryLocationUpdate } from "@/modules/merchant-ops/services/merchant-live-tracking.service";
import { getPersistenceRepository } from "@/server/persistence";
import { requireAdminContext } from "@/server/auth/guards";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  const { id } = await params;
  const delivery = await getPersistenceRepository().findMerchantDeliveryById(id);
  if (!delivery) {
    return NextResponse.json({ error: "Merchant delivery not found." }, { status: 404 });
  }

  const json = await request.json().catch(() => null);
  const parsed = merchantLocationUpdateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid location update." }, { status: 400 });
  }

  try {
    const actorId = "user" in adminContext ? adminContext.user.id : undefined;
    const event = await recordMerchantDeliveryLocationUpdate({
      merchantId: delivery.merchantId,
      merchantDeliveryId: delivery.id,
      actorId,
      actorType: "operations_admin",
      ...parsed.data,
    });

    return NextResponse.json({ ok: true, event });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to record live tracking update." },
      { status: 400 },
    );
  }
}
