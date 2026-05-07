"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bell, BellOff, CheckCircle2 } from "lucide-react";

type PushKeyResponse = {
  isConfigured: boolean;
  publicKey: string | null;
};

type HeartbeatPost = {
  id: string;
  title: string;
  body: string;
  ctaHref: string | null;
  publishedAt: string;
};

type HeartbeatResponse = {
  ok: boolean;
  latestPostAt: string | null;
  posts: HeartbeatPost[];
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

function playAlertSound() {
  const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return;

  const audioContext = new AudioContextClass();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
  oscillator.frequency.setValueAtTime(660, audioContext.currentTime + 0.12);
  gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.12, audioContext.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.32);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.34);
}

function vibrateDevice() {
  if ("vibrate" in navigator) {
    navigator.vibrate([140, 70, 140]);
  }
}

function showLocalNotification(post: HeartbeatPost, leadId: string) {
  const url = post.ctaHref || `/join/slyder/status?leadId=${encodeURIComponent(leadId)}`;
  if ("Notification" in window && Notification.permission === "granted") {
    const notification = new Notification(post.title || "SLYDE update", {
      body: post.body.length > 140 ? `${post.body.slice(0, 137)}...` : post.body,
      icon: "/images/slyde-logo-email.png",
      tag: `slyde-lead-post-${post.id}`,
      data: { url },
    });
    notification.onclick = () => {
      window.focus();
      window.location.assign(url);
    };
  }
}

export function SlyderLeadPushOptIn({ leadId, initialLatestPostAt }: { leadId: string; initialLatestPostAt: string | null }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSupported, setIsSupported] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [message, setMessage] = useState("Enable device alerts for SLYDE lead updates on this browser.");
  const [heartbeatMessage, setHeartbeatMessage] = useState("Checking for new SLYDE updates every 15 seconds while this page is open.");
  const [error, setError] = useState<string | null>(null);
  const latestPostAtRef = useRef(initialLatestPostAt);

  useEffect(() => {
    let isMounted = true;

    async function loadState() {
      const supported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
      if (!isMounted) return;
      setIsSupported(supported);
      if (!supported) {
        setMessage("Device alerts are not supported in this browser. Email and WhatsApp updates still work.");
        return;
      }

      const keyResponse = (await fetch("/api/public/slyder-leads/push-public-key").then((res) => res.json()).catch(() => null)) as PushKeyResponse | null;
      if (!isMounted) return;
      setIsConfigured(Boolean(keyResponse?.isConfigured && keyResponse.publicKey));
      if (!keyResponse?.isConfigured) {
        setMessage("Device alerts are not enabled yet. Email and WhatsApp updates still work.");
        return;
      }

      const registration = await navigator.serviceWorker.register("/slyde-lead-push-sw.js");
      const subscription = await registration.pushManager.getSubscription();
      if (!isMounted) return;
      setIsSubscribed(Boolean(subscription));
      if (subscription) {
        await fetch(`/api/public/slyder-leads/${leadId}/push-subscriptions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(subscription),
        }).catch(() => null);
        setMessage("Device alerts are on for this Slyder Lead Dashboard.");
      }
    }

    loadState().catch(() => {
      if (isMounted) {
        setMessage("Device alert status could not be checked. Email and WhatsApp updates still work.");
      }
    });

    return () => {
      isMounted = false;
    };
  }, [leadId]);

  useEffect(() => {
    let isMounted = true;
    let isChecking = false;

    async function checkForUpdates() {
      if (isChecking) return;
      isChecking = true;
      try {
        const since = latestPostAtRef.current;
        const endpoint = since ? `/api/public/slyder-lead-posts/latest?since=${encodeURIComponent(since)}` : "/api/public/slyder-lead-posts/latest";
        const payload = (await fetch(endpoint, { cache: "no-store" }).then((res) => res.json())) as HeartbeatResponse;
        if (!isMounted || !payload.ok) return;

        if (!latestPostAtRef.current) {
          latestPostAtRef.current = payload.latestPostAt;
          return;
        }

        if (payload.posts.length > 0) {
          const newestPost = payload.posts[payload.posts.length - 1];
          latestPostAtRef.current = payload.latestPostAt || newestPost.publishedAt;
          setHeartbeatMessage("New SLYDE update found. Refreshing your dashboard now.");
          vibrateDevice();
          playAlertSound();
          showLocalNotification(newestPost, leadId);
          router.refresh();
          return;
        }

        latestPostAtRef.current = payload.latestPostAt || latestPostAtRef.current;
        setHeartbeatMessage("Dashboard heartbeat is active. No new updates yet.");
      } catch {
        if (isMounted) {
          setHeartbeatMessage("Dashboard heartbeat could not check right now. It will try again shortly.");
        }
      } finally {
        isChecking = false;
      }
    }

    const interval = window.setInterval(checkForUpdates, 15000);
    window.setTimeout(checkForUpdates, 2500);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, [leadId, router]);

  function subscribe() {
    startTransition(async () => {
      setError(null);
      const keyResponse = (await fetch("/api/public/slyder-leads/push-public-key").then((res) => res.json())) as PushKeyResponse;
      if (!keyResponse.publicKey) {
        setError("Device alerts are not enabled yet.");
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setError("Notifications were not allowed on this browser.");
        return;
      }

      const registration = await navigator.serviceWorker.register("/slyde-lead-push-sw.js");
      const subscription =
        (await registration.pushManager.getSubscription()) ||
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(keyResponse.publicKey),
        }));

      const response = await fetch(`/api/public/slyder-leads/${leadId}/push-subscriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });

      if (!response.ok) {
        setError("Could not save this device for SLYDE alerts.");
        return;
      }

      setIsSubscribed(true);
      setMessage("Device alerts are on for this Slyder Lead Dashboard.");
      vibrateDevice();
      playAlertSound();
      showLocalNotification(
        {
          id: "enabled",
          title: "SLYDE alerts are on",
          body: "You will receive SLYDE lead dashboard updates on this browser when supported.",
          ctaHref: `/join/slyder/status?leadId=${encodeURIComponent(leadId)}`,
          publishedAt: new Date().toISOString(),
        },
        leadId,
      );
    });
  }

  function unsubscribe() {
    startTransition(async () => {
      setError(null);
      const registration = await navigator.serviceWorker.getRegistration("/slyde-lead-push-sw.js");
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription) {
        await fetch(`/api/public/slyder-leads/${leadId}/push-subscriptions`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        }).catch(() => null);
        await subscription.unsubscribe();
      }
      setIsSubscribed(false);
      setMessage("Device alerts are off for this browser.");
    });
  }

  return (
    <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
            {isSubscribed ? <CheckCircle2 className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-950">Device alerts</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">{message}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">{heartbeatMessage}</p>
            {error ? <p className="mt-2 text-sm font-semibold text-rose-600">{error}</p> : null}
          </div>
        </div>

        {isSupported && isConfigured ? (
          isSubscribed ? (
            <button
              type="button"
              onClick={unsubscribe}
              disabled={isPending}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 disabled:opacity-60"
            >
              <BellOff className="h-4 w-4" />
              Turn off
            </button>
          ) : (
            <button
              type="button"
              onClick={subscribe}
              disabled={isPending}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-slate-950 px-4 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5 disabled:opacity-60"
            >
              <Bell className="h-4 w-4" />
              Turn on alerts
            </button>
          )
        ) : null}
      </div>
    </div>
  );
}
