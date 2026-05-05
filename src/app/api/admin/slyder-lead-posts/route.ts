import { NextResponse } from "next/server";
import { requireAdminContext } from "@/server/auth/guards";
import { createSlyderLeadPostSchema } from "@/modules/leads/schemas/slyder-lead-post.schema";
import { createSlyderLeadPost } from "@/modules/leads/services/slyder-lead-post.service";

export async function POST(request: Request) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  try {
    const json = await request.json();
    const parsed = createSlyderLeadPostSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const post = await createSlyderLeadPost(parsed.data);
    return NextResponse.json({ ok: true, postId: post.id });
  } catch (error) {
    console.error("[api/admin/slyder-lead-posts] POST failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Could not create Slyder lead post." }, { status: 500 });
  }
}
