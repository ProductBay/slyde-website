import { NextResponse } from "next/server";
import { merchantDeliveriesFiltersSchema } from "@/modules/merchant-ops/schemas/merchant-dispatch.schema";
import { listMerchantDeliveries } from "@/modules/merchant-ops/services/merchant-delivery.service";
import { requireMerchantContext } from "@/server/auth/guards";

export async function GET(request: Request) {
  const context = await requireMerchantContext();
  if (context instanceof Response) return context;

  const { searchParams } = new URL(request.url);
  const filters = Object.fromEntries(searchParams.entries());
  const parsed = merchantDeliveriesFiltersSchema.safeParse(filters);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid delivery filters" }, { status: 400 });
  }

  const deliveries = await listMerchantDeliveries(context.merchantMembership.merchantId, parsed.data);
  return NextResponse.json({ deliveries });
}
