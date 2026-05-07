import { NextResponse } from "next/server";
import { pushSubscriptionSchema } from "@/modules/leads/schemas/slyder-lead-push.schema";
import { disableSlyderLeadPushSubscription, saveSlyderLeadPushSubscription } from "@/modules/leads/services/slyder-lead-push.service";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const json = await request.json();
    const parsed = pushSubscriptionSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    await saveSlyderLeadPushSubscription(id, parsed.data, request.headers.get("user-agent"));
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/public/slyder-leads/[id]/push-subscriptions] POST failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Could not save notification subscription." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const json = (await request.json().catch(() => null)) as { endpoint?: string } | null;
    if (!json?.endpoint) {
      return NextResponse.json({ error: "Subscription endpoint is required." }, { status: 400 });
    }

    await disableSlyderLeadPushSubscription(json.endpoint);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/public/slyder-leads/[id]/push-subscriptions] DELETE failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Could not disable notification subscription." }, { status: 500 });
  }
}
