import { NextResponse } from "next/server";
import { listAdminOutOfParishDeliveries } from "@/modules/partner-carriers/services/tracking-projection.service";
import { requireAdminContext } from "@/server/auth/guards";

export async function GET() {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  const deliveries = await listAdminOutOfParishDeliveries();
  return NextResponse.json({ deliveries });
}
