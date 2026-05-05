import { NextResponse } from "next/server";
import { getSlyderLeadWhatsappUrl } from "@/modules/leads/services/slyder-lead.service";
import { requireAdminContext } from "@/server/auth/guards";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  try {
    const { id } = await params;
    const result = await getSlyderLeadWhatsappUrl(id);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create WhatsApp message." },
      { status: 400 },
    );
  }
}
