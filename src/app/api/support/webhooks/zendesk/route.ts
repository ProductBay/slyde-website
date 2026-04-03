import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { supportWebhookSchema } from "@/modules/support/schemas/support-webhook.schema";
import { getSupportWebhookSecret } from "@/modules/support/services/support-provider.service";
import { ingestSupportWebhook } from "@/modules/support/services/support-webhook.service";

function verifyZendeskSignature(body: string, signature: string | null, secret: string | undefined) {
  if (!secret) {
    return true;
  }

  if (!signature) {
    return false;
  }

  const expected = createHmac("sha256", secret).update(body).digest("hex");
  const received = signature.replace(/^sha256=/i, "");
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, receivedBuffer);
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-slyde-support-signature") ?? request.headers.get("x-zendesk-webhook-signature");
  const secret = getSupportWebhookSecret("zendesk");

  if (!verifyZendeskSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  const json = (() => {
    try {
      return JSON.parse(rawBody || "{}");
    } catch {
      return null;
    }
  })();
  if (!json || typeof json !== "object" || Array.isArray(json)) {
    return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
  }

  const parsed = supportWebhookSchema.safeParse({
    provider: "zendesk",
    ...json,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid support webhook" }, { status: 400 });
  }

  const normalized = await ingestSupportWebhook(parsed.data);
  return NextResponse.json({ ok: true, normalized });
}
