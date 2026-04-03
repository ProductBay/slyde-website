import { NextResponse } from "next/server";
import { getMerchantDashboardData } from "@/modules/merchant-ops/services/merchant-dashboard.service";
import { requireMerchantContext } from "@/server/auth/guards";

export async function GET() {
  const context = await requireMerchantContext();
  if (context instanceof Response) return context;

  const data = await getMerchantDashboardData(context.merchantMembership.merchantId);
  return NextResponse.json(data);
}
