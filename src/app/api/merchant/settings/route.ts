import { NextResponse } from "next/server";
import { merchantSettingsSchema } from "@/modules/merchant-ops/schemas/merchant-settings.schema";
import { getMerchantSettings, updateMerchantSettings } from "@/modules/merchant-ops/services/merchant-settings.service";
import { requireMerchantContext } from "@/server/auth/guards";

export async function GET() {
  const context = await requireMerchantContext({ allowRestricted: true });
  if (context instanceof Response) return context;

  const settings = await getMerchantSettings(context.merchantMembership.merchantId);
  return NextResponse.json(settings);
}

export async function POST(request: Request) {
  const context = await requireMerchantContext({ allowRestricted: true });
  if (context instanceof Response) return context;

  const json = await request.json().catch(() => null);
  const parsed = merchantSettingsSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid settings" }, { status: 400 });
  }

  try {
    const settings = await updateMerchantSettings(context.merchantMembership.merchantId, parsed.data);
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update settings" }, { status: 400 });
  }
}
