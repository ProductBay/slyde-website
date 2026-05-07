import webPush, { type PushSubscription } from "web-push";
import { prisma } from "@/server/db/prisma";
import type { PushSubscriptionInput } from "@/modules/leads/schemas/slyder-lead-push.schema";

const vapidPublicKey = process.env.NEXT_PUBLIC_SLYDE_WEB_PUSH_PUBLIC_KEY || process.env.SLYDE_WEB_PUSH_PUBLIC_KEY;
const vapidPrivateKey = process.env.SLYDE_WEB_PUSH_PRIVATE_KEY;
const vapidSubject = process.env.SLYDE_WEB_PUSH_SUBJECT || "mailto:support@slydenetwork.com";

function isPushConfigured() {
  return Boolean(vapidPublicKey && vapidPrivateKey);
}

function configureWebPush() {
  if (!isPushConfigured()) return false;
  webPush.setVapidDetails(vapidSubject, vapidPublicKey!, vapidPrivateKey!);
  return true;
}

export function getSlyderLeadPushPublicKey() {
  return vapidPublicKey ?? null;
}

export async function saveSlyderLeadPushSubscription(leadId: string, subscription: PushSubscriptionInput, userAgent?: string | null) {
  const lead = await prisma.slyderLead.findUnique({ where: { id: leadId }, select: { id: true } });
  if (!lead) {
    throw new Error("Slyder lead not found");
  }

  return prisma.slyderLeadPushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    create: {
      leadId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      userAgent: userAgent || null,
      isActive: true,
      lastSeenAt: new Date(),
    },
    update: {
      leadId,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      userAgent: userAgent || null,
      isActive: true,
      lastSeenAt: new Date(),
    },
  });
}

export async function disableSlyderLeadPushSubscription(endpoint: string) {
  return prisma.slyderLeadPushSubscription.updateMany({
    where: { endpoint },
    data: { isActive: false },
  });
}

export async function notifySlyderLeadSubscribersForPost(post: {
  id: string;
  title: string;
  body: string;
  ctaHref: string | null;
  isPublished: boolean;
}) {
  if (!post.isPublished || !configureWebPush()) {
    return { sent: 0, skipped: true };
  }

  const subscriptions = await prisma.slyderLeadPushSubscription.findMany({
    where: { isActive: true },
    select: {
      id: true,
      endpoint: true,
      p256dh: true,
      auth: true,
      failureCount: true,
      leadId: true,
    },
  });

  let sent = 0;
  await Promise.all(
    subscriptions.map(async (subscription) => {
      const dashboardUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://slydenetwork.com"}/join/slyder/status?leadId=${encodeURIComponent(subscription.leadId)}`;
      const payload = JSON.stringify({
        title: post.title,
        body: post.body.length > 140 ? `${post.body.slice(0, 137)}...` : post.body,
        url: post.ctaHref || dashboardUrl,
        tag: `slyde-lead-post-${post.id}`,
      });

      const pushSubscription: PushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      };

      try {
        await webPush.sendNotification(pushSubscription, payload);
        sent += 1;
        await prisma.slyderLeadPushSubscription.update({
          where: { id: subscription.id },
          data: { lastSentAt: new Date(), failureCount: 0 },
        });
      } catch (error) {
        const statusCode = typeof error === "object" && error && "statusCode" in error ? Number(error.statusCode) : 0;
        await prisma.slyderLeadPushSubscription.update({
          where: { id: subscription.id },
          data: {
            failureCount: subscription.failureCount + 1,
            isActive: statusCode === 404 || statusCode === 410 ? false : subscription.failureCount + 1 < 5,
          },
        });
      }
    }),
  );

  return { sent, skipped: false };
}
