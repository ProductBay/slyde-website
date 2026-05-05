import { NextResponse } from "next/server";
import { requireAdminContext } from "@/server/auth/guards";
import { updateSlyderLeadPostSchema } from "@/modules/leads/schemas/slyder-lead-post.schema";
import { deleteSlyderLeadPost, updateSlyderLeadPost } from "@/modules/leads/services/slyder-lead-post.service";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  try {
    const { id } = await params;
    const json = await request.json();
    const parsed = updateSlyderLeadPostSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    await updateSlyderLeadPost(id, parsed.data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/admin/slyder-lead-posts/[id]] PATCH failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Could not update Slyder lead post." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  try {
    const { id } = await params;
    await deleteSlyderLeadPost(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/admin/slyder-lead-posts/[id]] DELETE failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Could not delete Slyder lead post." }, { status: 500 });
  }
}
