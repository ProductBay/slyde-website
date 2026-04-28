import { NextResponse } from "next/server";
import { registerUserSchema } from "@/modules/user-auth/schemas/user-auth.schemas";
import { registerUser } from "@/modules/user-auth/services/user-auth.service";

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = registerUserSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  try {
    const result = await registerUser(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Registration failed";
    if (message.includes("already exists")) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.json({ error: "Unable to create your account right now. Please try again." }, { status: 400 });
  }
}
