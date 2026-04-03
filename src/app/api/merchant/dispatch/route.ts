import { NextResponse } from "next/server";
import { quickDispatchSchema } from "@/modules/merchant-ops/schemas/merchant-dispatch.schema";
import { createQuickDispatch } from "@/modules/merchant-ops/services/merchant-dispatch.service";
import { requireMerchantContext } from "@/server/auth/guards";

export async function POST(request: Request) {
  const context = await requireMerchantContext();
  if (context instanceof Response) return context;

  const json = await request.json().catch(() => null);
  const parsed = quickDispatchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid dispatch request" }, { status: 400 });
  }

  try {
    const result = await createQuickDispatch(
      context.merchantMembership.merchantId,
      parsed.data,
      context.user.id,
    );
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create dispatch" }, { status: 400 });
  }
}
