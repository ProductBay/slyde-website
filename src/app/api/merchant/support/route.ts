import { NextResponse } from "next/server";
import { merchantSupportSchema } from "@/modules/merchant-ops/schemas/merchant-support.schema";
import { getMerchantSupportChannels, submitMerchantSupportRequest } from "@/modules/merchant-ops/services/merchant-support.service";
import { requireMerchantContext } from "@/server/auth/guards";

export async function GET() {
  const context = await requireMerchantContext({ allowRestricted: true });
  if (context instanceof Response) return context;

  return NextResponse.json(getMerchantSupportChannels());
}

export async function POST(request: Request) {
  const context = await requireMerchantContext({ allowRestricted: true });
  if (context instanceof Response) return context;

  const json = await request.json().catch(() => null);
  const parsed = merchantSupportSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid support request" }, { status: 400 });
  }

  try {
    const result = await submitMerchantSupportRequest(
      context.merchantMembership.merchantId,
      parsed.data,
      context.user.id,
    );
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to submit support request" }, { status: 400 });
  }
}
