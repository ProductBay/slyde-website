import { NextResponse } from "next/server";
import { logoutMerchant } from "@/modules/merchant-ops/services/merchant-auth.service";

export async function POST() {
  await logoutMerchant();
  return NextResponse.json({ ok: true });
}
