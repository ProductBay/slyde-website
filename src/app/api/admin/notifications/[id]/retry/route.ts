import { NextResponse } from "next/server";
import { retryAdminNotification } from "@/modules/admin/services/admin-control-tower.service";
import { requireAdminContext } from "@/server/auth/guards";

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  try {
    const { id } = await context.params;
    const notification = await retryAdminNotification(id);
    return NextResponse.json(notification);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Retry failed" }, { status: 400 });
  }
}

