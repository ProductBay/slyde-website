import { NextResponse } from "next/server";
import { getAdminOutOfParishDeliveryDetail } from "@/modules/partner-carriers/services/tracking-projection.service";
import { requireAdminContext } from "@/server/auth/guards";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Params) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  const { id } = await params;
  const detail = await getAdminOutOfParishDeliveryDetail(id);
  if (!detail) {
    return NextResponse.json({ error: "Out-of-parish delivery not found" }, { status: 404 });
  }

  return NextResponse.json(detail);
}
