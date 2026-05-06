"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { playAdminChime } from "@/lib/admin-chime";

const POLL_INTERVAL_MS = 20_000;

type AlertCounts = { users: number; leads: number };

export function AdminLiveBell() {
  const prevCounts = useRef<AlertCounts | null>(null);
  const initialized = useRef(false);
  const [newLeads, setNewLeads] = useState(0);
  const [newUsers, setNewUsers] = useState(0);
  const [pulsing, setPulsing] = useState(false);
  const pulseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalNew = newLeads + newUsers;

  function triggerPulse() {
    setPulsing(true);
    if (pulseTimer.current) clearTimeout(pulseTimer.current);
    pulseTimer.current = setTimeout(() => setPulsing(false), 4000);
  }

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
        prevCounts.current = counts;
        initialized.current = true;
        return;
      }

      const prev = prevCounts.current!;
      let changed = false;

      if (counts.leads > prev.leads) {
        const delta = counts.leads - prev.leads;
        setNewLeads((n) => n + delta);
        playAdminChime("lead");
        changed = true;
      }

      if (counts.users > prev.users) {
        const delta = counts.users - prev.users;
        setNewUsers((n) => n + delta);
        playAdminChime("user");
        changed = true;
      }

      if (changed) triggerPulse();
      prevCounts.current = counts;
    }

    poll();
    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      clearInterval(id);
      if (pulseTimer.current) clearTimeout(pulseTimer.current);
    };
  }, []);

  function dismiss() {
    setNewLeads(0);
    setNewUsers(0);
    setPulsing(false);
  }

  const label = totalNew === 0
    ? "No new activity"
    : [
        newLeads > 0 ? `${newLeads} new lead${newLeads > 1 ? "s" : ""}` : "",
        newUsers > 0 ? `${newUsers} new user${newUsers > 1 ? "s" : ""}` : "",
      ]
        .filter(Boolean)
        .join(", ");

  return (
    <button
      type="button"
      onClick={dismiss}
      aria-label={label}
      title={label}
      className="admin-icon-button relative"
    >
      <Bell className="h-4 w-4" />

      {/* Pulse ring — animates when new activity arrives */}
      {pulsing && (
        <span className="absolute -right-0.5 -top-0.5 h-3 w-3">
          <span className="absolute inset-0 animate-ping rounded-full bg-rose-500 opacity-75" />
        </span>
      )}

      {/* Badge — persists until dismissed */}
      {totalNew > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-0.5 text-[10px] font-bold leading-none text-white shadow-sm">
          {totalNew > 99 ? "99+" : totalNew}
        </span>
      )}
    </button>
  );
}
