import { NextResponse } from "next/server";
import { cancelMerchantOrder } from "@/modules/merchant-ops/services/merchant-order.service";
import { requireMerchantContext } from "@/server/auth/guards";

type Params = { params: Promise<{ id: string }> };

export async function POST(_: Request, { params }: Params) {
  const context = await requireMerchantContext();
  if (context instanceof Response) return context;

  try {
    const { id } = await params;
    const order = await cancelMerchantOrder(context.merchantMembership.merchantId, id, context.user.id);
    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to cancel order" }, { status: 400 });
  }
}
