import { NextResponse } from "next/server";
import { requireAdminContext } from "@/server/auth/guards";
import { resendAdminNotification } from "@/modules/admin/services/admin-control-tower.service";

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  try {
    const { id } = await context.params;
    const notification = await resendAdminNotification(id, adminContext.user.id);
    return NextResponse.json(notification);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Resend failed" }, { status: 400 });
  }
}
