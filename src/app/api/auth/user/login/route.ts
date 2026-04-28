import { NextResponse } from "next/server";
import { loginUserSchema } from "@/modules/user-auth/schemas/user-auth.schemas";
import { loginUser } from "@/modules/user-auth/services/user-auth.service";

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = loginUserSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  try {
    const result = await loginUser(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Sign in failed" }, { status: 400 });
  }
}
