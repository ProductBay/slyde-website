import { NextResponse } from "next/server";
import { requireAdminContext } from "@/server/auth/guards";
import { merchantAssignAdminSchema } from "@/modules/merchant/schemas/merchant-application.schema";
import { assignMerchantApplicationAdmin } from "@/modules/merchant/services/merchant-application.service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  const actorId = "user" in adminContext ? adminContext.user.id : undefined;
  const payload = (await request.json().catch(() => null)) || {
    assignedAdminId: actorId,
  };
  const parsed = merchantAssignAdminSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { id } = await params;
  const application = await assignMerchantApplicationAdmin(id, parsed.data, actorId);
  return NextResponse.json({ ok: true, application });
}
