import crypto from "node:crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createReferralEvent, updateReferral } from "@/modules/referrals/repositories/referral.repository";
import { publicReferralSubmissionSchema } from "@/modules/referrals/schemas/public-referral.schema";
import { submitReferral } from "@/modules/referrals/services/public-referral.service";
import { sendPublicReferralInviteNotification } from "@/server/notifications/notification.service";
import { protectPublicRoute } from "@/server/security/public-route-protection";

function nowIso() {
  return new Date().toISOString();
}

export async function POST(request: Request) {
  const protection = await protectPublicRoute(request, {
    routeKey: "public_slyder_referrals",
    limit: 6,
    windowMs: 10 * 60 * 1000,
    requireTurnstile: true,
  });
  if (protection) return protection;

  const json = await request.json();
  const parsed = publicReferralSubmissionSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const headerStore = await headers();
    let referral = await submitReferral(parsed.data, {
      ipAddress: headerStore.get("x-forwarded-for") ?? undefined,
      userAgent: headerStore.get("user-agent") ?? undefined,
    });

    try {
      await sendPublicReferralInviteNotification(referral);
      if (referral.referredEmail) {
        referral = await updateReferral({
          ...referral,
          inviteEmailSentAt: nowIso(),
          inviteEmailStatus: "sent",
          updatedAt: nowIso(),
        });
        await createReferralEvent({
          id: crypto.randomUUID(),
          referralId: referral.id,
          eventType: "invite_email_sent",
          title: "Invite email sent",
          description: "Referral invite email sent to referred driver.",
          metadata: { referredEmail: referral.referredEmail },
          createdAt: nowIso(),
        });
      }
    } catch (notificationError) {
      if (referral.referredEmail) {
        referral = await updateReferral({
          ...referral,
          inviteEmailStatus: "failed",
          updatedAt: nowIso(),
        });
      }
      console.error("[public-referrals] invite email failed", {
        referralId: referral.id,
        referralCode: referral.referralCode,
        error: notificationError instanceof Error ? notificationError.message : notificationError,
      });
    }

    return NextResponse.json(
      {
        ok: true,
        referralId: referral.id,
        referralCode: referral.referralCode,
        status: referral.status,
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not submit referral." },
      { status: 400 },
    );
  }
}
