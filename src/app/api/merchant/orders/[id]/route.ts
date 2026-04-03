import { NextResponse } from "next/server";
import { getMerchantOrderDetail } from "@/modules/merchant-ops/services/merchant-order.service";
import { requireMerchantContext } from "@/server/auth/guards";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Params) {
  const context = await requireMerchantContext();
  if (context instanceof Response) return context;

  const { id } = await params;
  const order = await getMerchantOrderDetail(context.merchantMembership.merchantId, id);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ order });
}
