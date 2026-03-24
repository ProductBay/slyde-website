import { NextResponse } from "next/server";
import { getSystemHealthSummary } from "@/server/ops/system-health.service";

export async function GET() {
  const summary = await getSystemHealthSummary();

  return NextResponse.json(summary, {
    status: summary.overallStatus === "unhealthy" ? 503 : 200,
  });
}
