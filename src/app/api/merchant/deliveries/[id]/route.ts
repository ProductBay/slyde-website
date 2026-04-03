import { NextResponse } from "next/server";
import { getMerchantDeliveryDetail } from "@/modules/merchant-ops/services/merchant-delivery.service";
import { requireMerchantContext } from "@/server/auth/guards";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Params) {
  const context = await requireMerchantContext();
  if (context instanceof Response) return context;

  const { id } = await params;
  const detail = await getMerchantDeliveryDetail(context.merchantMembership.merchantId, id);
  if (!detail) {
    return NextResponse.json({ error: "Delivery not found" }, { status: 404 });
  }

  return NextResponse.json(detail);
}
