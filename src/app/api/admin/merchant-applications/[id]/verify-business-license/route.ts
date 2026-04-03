import { NextResponse } from "next/server";
import { verifyMerchantBusinessLicense } from "@/modules/merchant-ops/services/merchant-business-license.service";
import { requireAdminContext } from "@/server/auth/guards";

type Params = { params: Promise<{ id: string }> };

export async function POST(_: Request, { params }: Params) {
  const context = await requireAdminContext();
  if (context instanceof Response) return context;

  const { id } = await params;

  try {
    const application = await verifyMerchantBusinessLicense(id, context.user.id);
    return NextResponse.json({ application });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to verify business license" },
      { status: 400 },
    );
  }
}
