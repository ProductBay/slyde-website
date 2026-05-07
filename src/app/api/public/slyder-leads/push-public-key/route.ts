import { NextResponse } from "next/server";
import { getSlyderLeadPushPublicKey } from "@/modules/leads/services/slyder-lead-push.service";

export async function GET() {
  const publicKey = getSlyderLeadPushPublicKey();
  return NextResponse.json({
    isConfigured: Boolean(publicKey),
    publicKey,
  });
}
