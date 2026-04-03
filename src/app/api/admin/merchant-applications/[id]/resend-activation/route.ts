import { NextResponse } from "next/server";
import { requireAdminContext } from "@/server/auth/guards";
import { resendMerchantActivation } from "@/modules/merchant/services/merchant-application.service";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  const { id } = await params;
  const actorId = "user" in adminContext ? adminContext.user.id : undefined;
  const result = await resendMerchantActivation(id, actorId);
  return NextResponse.json({ ok: true, ...result });
}
