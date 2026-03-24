import { NextResponse } from "next/server";
import { employeeApplicationSchema } from "@/modules/employee/schemas/employee.schemas";
import { submitEmployeeApplication } from "@/modules/employee/services/employee-portal.service";

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = employeeApplicationSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid application" }, { status: 400 });
  }

  try {
    const application = await submitEmployeeApplication(parsed.data);
    return NextResponse.json({ id: application.id, status: application.status });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to submit application" }, { status: 400 });
  }
}
