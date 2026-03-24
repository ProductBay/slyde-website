import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/forms";
import { protectPublicRoute } from "@/server/security/public-route-protection";

export async function POST(request: Request) {
  const protection = await protectPublicRoute(request, {
    routeKey: "public_contact",
    limit: 6,
    windowMs: 10 * 60 * 1000,
    requireTurnstile: true,
  });
  if (protection) return protection;

  const json = await request.json();
  const parsed = contactSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  return NextResponse.json(
    {
      ok: true,
      contact: parsed.data,
      workflow: {
        currentStage: "message_received",
        nextStage: "support_or_follow_up",
      },
    },
    { status: 201 },
  );
}
