import { NextResponse } from "next/server";
import { partnerHandoffLocationSchema } from "@/modules/partner-carriers/schemas/partner-carrier.schema";
import { createPartnerHandoffLocationRecord, listPartnerCarrierLocations } from "@/modules/partner-carriers/services/partner-carrier.service";
import { requireAdminContext } from "@/server/auth/guards";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Params) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  const { id } = await params;
  const locations = await listPartnerCarrierLocations(id);
  return NextResponse.json({ locations });
}

export async function POST(request: Request, { params }: Params) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  const { id } = await params;
  const json = await request.json().catch(() => null);
  const parsed = partnerHandoffLocationSchema.safeParse({
    ...(json ?? {}),
    partnerCarrierId: id,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid location payload" }, { status: 400 });
  }

  const location = await createPartnerHandoffLocationRecord(parsed.data);
  return NextResponse.json({ ok: true, location });
}
