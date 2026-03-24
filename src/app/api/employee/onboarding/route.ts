import { NextResponse } from "next/server";
import { employeeOnboardingSchema } from "@/modules/employee/schemas/employee.schemas";
import { completeEmployeeOnboarding } from "@/modules/employee/services/employee-auth.service";
import { requireEmployeeContext } from "@/server/auth/guards";

export async function POST(request: Request) {
  const employeeContext = await requireEmployeeContext();
  if (employeeContext instanceof NextResponse) return employeeContext;

  const json = await request.json().catch(() => null);
  const parsed = employeeOnboardingSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid onboarding data" }, { status: 400 });
  }

  try {
    const result = await completeEmployeeOnboarding(employeeContext.user.id, parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to complete onboarding" }, { status: 400 });
  }
}
