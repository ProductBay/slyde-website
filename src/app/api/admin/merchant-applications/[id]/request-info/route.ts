import { NextResponse } from "next/server";
import { requireAdminContext } from "@/server/auth/guards";
import { merchantRequestInfoSchema } from "@/modules/merchant/schemas/merchant-status.schema";
import { requestMerchantApplicantInformation } from "@/modules/merchant/services/merchant-status.service";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  const { id } = await context.params;
  const json = await request.json().catch(() => null);
  const parsed = merchantRequestInfoSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const event = await requestMerchantApplicantInformation(id, parsed.data, adminContext.user.id);
    return NextResponse.json({ ok: true, event });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to request more information." }, { status: 400 });
  }
}
