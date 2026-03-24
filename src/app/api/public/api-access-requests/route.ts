import { NextResponse } from "next/server";
import { apiAccessSchema } from "@/lib/forms";
import { protectPublicRoute } from "@/server/security/public-route-protection";

export async function POST(request: Request) {
  const protection = await protectPublicRoute(request, {
    routeKey: "public_api_access_requests",
    limit: 5,
    windowMs: 10 * 60 * 1000,
    requireTurnstile: true,
  });
  if (protection) return protection;

  const json = await request.json();
  const parsed = apiAccessSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  return NextResponse.json(
    {
      ok: true,
      apiAccessRequest: parsed.data,
      workflow: {
        currentStage: "request_received",
        nextStage: "integration_review",
      },
    },
    { status: 201 },
  );
}
