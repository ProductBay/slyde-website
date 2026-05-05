import { NextResponse } from "next/server";
import { resendAdminUserRegistrationEmail } from "@/modules/admin/services/admin-users.service";
import { requireAdminContext } from "@/server/auth/guards";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  try {
    const { id } = await params;
    const result = await resendAdminUserRegistrationEmail(id, adminContext.user.id);
    return NextResponse.json({ ok: true, notificationId: result.id, status: result.status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to resend registration email." },
      { status: 400 },
    );
  }
}
