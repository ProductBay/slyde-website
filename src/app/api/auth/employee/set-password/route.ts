import { NextResponse } from "next/server";
import { employeeSetPasswordSchema } from "@/modules/employee/schemas/employee.schemas";
import { setEmployeePassword } from "@/modules/employee/services/employee-auth.service";

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = employeeSetPasswordSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid activation input" }, { status: 400 });
  }

  try {
    const result = await setEmployeePassword(parsed.data.token, parsed.data.password);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 400 });
  }
}
