import { NextResponse } from "next/server";
import { employeeApplicationInviteSchema } from "@/modules/employee/schemas/employee.schemas";
import { inviteEmployeeApplicant } from "@/modules/employee/services/employee-portal.service";
import { requireAdminContext } from "@/server/auth/guards";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  const json = await request.json().catch(() => null);
  const parsed = employeeApplicationInviteSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid invite input" }, { status: 400 });
  }

  const { id } = await context.params;

  try {
    const result = await inviteEmployeeApplicant(id, {
      id: adminContext.user.id,
      fullName: adminContext.user.fullName,
    }, parsed.data.reviewNotes);

    return NextResponse.json({
      ok: true,
      application: result.application,
      user: result.user,
      employeeProfile: result.profile,
      message: `Employee invite email sent to ${result.user.email}. They can now create a password and begin onboarding.`,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 400 });
  }
}
