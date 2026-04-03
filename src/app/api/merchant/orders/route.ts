import { NextResponse } from "next/server";
import { merchantOrderFiltersSchema } from "@/modules/merchant-ops/schemas/merchant-dispatch.schema";
import { listMerchantOrders } from "@/modules/merchant-ops/services/merchant-order.service";
import { requireMerchantContext } from "@/server/auth/guards";

export async function GET(request: Request) {
  const context = await requireMerchantContext();
  if (context instanceof Response) return context;

  const { searchParams } = new URL(request.url);
  const filters = Object.fromEntries(searchParams.entries());
  const parsed = merchantOrderFiltersSchema.safeParse(filters);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid order filters" }, { status: 400 });
  }

  const orders = await listMerchantOrders(context.merchantMembership.merchantId, parsed.data);
  return NextResponse.json({ orders });
}
