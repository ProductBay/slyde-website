"use client";

import { useEffect, useRef } from "react";
import { playAdminChime } from "@/lib/admin-chime";

const POLL_INTERVAL_MS = 20_000; // every 20 seconds

type AlertCounts = { users: number; leads: number };

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
        playAdminChime("user");
      }

      if (counts.leads > prev.leads) {
        playAdminChime("lead");
      }

      prevCounts.current = counts;
    }

    poll(); // immediate on mount
    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return null;
}
