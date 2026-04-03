import { NextResponse } from "next/server";
import { requireAdminContext } from "@/server/auth/guards";
import { getMerchantApplicationDetail } from "@/modules/merchant/services/merchant-application.service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  const { id } = await params;
  const detail = await getMerchantApplicationDetail(id);
  if (!detail) {
    return NextResponse.json({ error: "Merchant application not found." }, { status: 404 });
  }

  return NextResponse.json(detail);
}
