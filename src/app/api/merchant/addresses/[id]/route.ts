import { NextResponse } from "next/server";
import { merchantAddressSchema } from "@/modules/merchant-ops/schemas/merchant-address.schema";
import { removeMerchantAddress, updateMerchantAddressRecord } from "@/modules/merchant-ops/services/merchant-address.service";
import { requireMerchantContext } from "@/server/auth/guards";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const context = await requireMerchantContext();
  if (context instanceof Response) return context;

  const json = await request.json().catch(() => null);
  const parsed = merchantAddressSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid address" }, { status: 400 });
  }

  try {
    const { id } = await params;
    const address = await updateMerchantAddressRecord(context.merchantMembership.merchantId, id, parsed.data);
    return NextResponse.json({ address });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update address" }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: Params) {
  const context = await requireMerchantContext();
  if (context instanceof Response) return context;

  try {
    const { id } = await params;
    await removeMerchantAddress(context.merchantMembership.merchantId, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to delete address" }, { status: 400 });
  }
}
