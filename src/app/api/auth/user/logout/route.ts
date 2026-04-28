import { NextResponse } from "next/server";
import { logoutUser } from "@/modules/user-auth/services/user-auth.service";

export async function POST() {
  await logoutUser();
  return NextResponse.json({ ok: true });
}
