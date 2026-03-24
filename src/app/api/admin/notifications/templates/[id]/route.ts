import { NextResponse } from "next/server";
import { updateNotificationTemplate } from "@/server/notifications/notification.service";
import { requireAdminContext } from "@/server/auth/guards";
import { updateNotificationTemplateSchema } from "@/modules/notifications/schemas/notification.schemas";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  const json = await request.json();
  const parsed = updateNotificationTemplateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const { id } = await context.params;
    const template = await updateNotificationTemplate(id, parsed.data);
    return NextResponse.json(template);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Template update failed" }, { status: 400 });
  }
}

