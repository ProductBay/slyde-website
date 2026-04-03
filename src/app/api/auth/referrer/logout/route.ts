import { NextResponse } from "next/server";
import { logoutReferrer } from "@/modules/referrals/services/referrer-auth.service";

export async function POST() {
  await logoutReferrer();
  return NextResponse.json({ ok: true });
}
