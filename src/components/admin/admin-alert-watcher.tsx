"use client";

import { useEffect, useRef } from "react";

const POLL_INTERVAL_MS = 20_000; // every 20 seconds

type AlertCounts = { users: number; leads: number };

function playAlertChime(type: "user" | "lead") {
  try {
    const ctx = new AudioContext();

    // Two-tone ascending chime
    const notes = type === "user"
      ? [880, 1100]   // user registration: bright high ding
      : [660, 880];   // lead: slightly lower warm ding

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.18);

      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.18);
      gain.gain.linearRampToValueAtTime(0.55, ctx.currentTime + i * 0.18 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.18 + 0.55);

      osc.start(ctx.currentTime + i * 0.18);
      osc.stop(ctx.currentTime + i * 0.18 + 0.6);
    });

    // Let the AudioContext close after playback
    setTimeout(() => ctx.close(), 2000);
  } catch {
    // AudioContext not available (SSR guard — should not reach here)
  }
}

export function AdminAlertWatcher() {
  const prevCounts = useRef<AlertCounts | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    async function fetchCounts(): Promise<AlertCounts | null> {
      try {
        const res = await fetch("/api/admin/alert-counts", { cache: "no-store" });
        if (!res.ok) return null;
        return (await res.json()) as AlertCounts;
      } catch {
        return null;
      }
    }

    async function poll() {
      const counts = await fetchCounts();
      if (!counts) return;

      if (!initialized.current) {
        // First fetch — seed the baseline, no sound
        prevCounts.current = counts;
        initialized.current = true;
        return;
      }

      const prev = prevCounts.current!;

      if (counts.users > prev.users) {
        playAlertChime("user");
      }

      if (counts.leads > prev.leads) {
        playAlertChime("lead");
      }

      prevCounts.current = counts;
    }

    poll(); // immediate on mount
    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return null;
}
