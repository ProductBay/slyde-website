import { NextResponse } from "next/server";
import { merchantAddressSchema } from "@/modules/merchant-ops/schemas/merchant-address.schema";
import { createMerchantAddress, listMerchantAddresses } from "@/modules/merchant-ops/services/merchant-address.service";
import { requireMerchantContext } from "@/server/auth/guards";

export async function GET() {
  const context = await requireMerchantContext();
  if (context instanceof Response) return context;

  const addresses = await listMerchantAddresses(context.merchantMembership.merchantId);
  return NextResponse.json({ addresses });
}

export async function POST(request: Request) {
  const context = await requireMerchantContext();
  if (context instanceof Response) return context;

  const json = await request.json().catch(() => null);
  const parsed = merchantAddressSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid address" }, { status: 400 });
  }

  try {
    const address = await createMerchantAddress(context.merchantMembership.merchantId, parsed.data);
    return NextResponse.json({ address });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save address" }, { status: 400 });
  }
}
