import { NextResponse } from "next/server";
import { employeeApplicationRejectSchema } from "@/modules/employee/schemas/employee.schemas";
import { rejectEmployeeApplicant } from "@/modules/employee/services/employee-portal.service";
import { requireAdminContext } from "@/server/auth/guards";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  const json = await request.json().catch(() => null);
  const parsed = employeeApplicationRejectSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid rejection input" }, { status: 400 });
  }

  const { id } = await context.params;

  try {
    const result = await rejectEmployeeApplicant(id, parsed.data.reason, {
      id: adminContext.user.id,
      fullName: adminContext.user.fullName,
    });

    return NextResponse.json({
      ok: true,
      application: result,
      message: `Employee application rejected for ${result.email}.`,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 400 });
  }
}
