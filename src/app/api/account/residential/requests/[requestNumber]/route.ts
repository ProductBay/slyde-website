import { NextResponse } from "next/server";
import { getSessionContext } from "@/server/auth/session";
import { getDispatchRequestDetail } from "@/modules/residential-intake/repositories/residential-intake.repository";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ requestNumber: string }> },
) {
  const session = await getSessionContext();
  if (!session?.user?.isEnabled) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { requestNumber } = await params;
  if (!requestNumber) {
    return NextResponse.json({ error: "Missing requestNumber" }, { status: 400 });
  }

  const request = await getDispatchRequestDetail(requestNumber, session.user.id);
  if (!request) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ request });
}
