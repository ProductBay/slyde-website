import { NextResponse } from "next/server";
import { requireAdminContext } from "@/server/auth/guards";
import { merchantActivateSchema } from "@/modules/merchant/schemas/merchant-application.schema";
import { activateMerchantApplication } from "@/modules/merchant/services/merchant-application.service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  const json = await request.json().catch(() => null);
  const parsed = merchantActivateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { id } = await params;
  const actorId = "user" in adminContext ? adminContext.user.id : undefined;
  const application = await activateMerchantApplication(id, parsed.data, actorId);
  return NextResponse.json({ ok: true, application });
}
