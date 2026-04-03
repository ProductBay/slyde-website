import { NextResponse } from "next/server";
import { requireAdminContext } from "@/server/auth/guards";
import { merchantLeadFiltersSchema } from "@/modules/merchant/schemas/merchant-lead.schema";
import { listMerchantLeadRows } from "@/modules/merchant/services/merchant-lead.service";

export async function GET(request: Request) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  const url = new URL(request.url);
  const parsed = merchantLeadFiltersSchema.safeParse({
    status: url.searchParams.get("status") ?? undefined,
    parish: url.searchParams.get("parish") ?? undefined,
    productIntent: url.searchParams.get("productIntent") ?? undefined,
    search: url.searchParams.get("search") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const rows = await listMerchantLeadRows(parsed.data);
  return NextResponse.json({ rows });
}
