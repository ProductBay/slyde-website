"use client";

import { useState } from "react";
import { Volume2 } from "lucide-react";
import { playAdminChime } from "@/lib/admin-chime";

type FireState = "idle" | "user" | "lead";

export function SoundTestPanel() {
  const [firing, setFiring] = useState<FireState>("idle");

  function test(type: "user" | "lead") {
    playAdminChime(type);
    setFiring(type);
    setTimeout(() => setFiring("idle"), 1200);
  }

  return (
    <div className="surface-panel p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
          <Volume2 className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Alert Sound Test</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Plays the same chimes fired when a new user or Slyder lead arrives in the dashboard.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {/* New User chime */}
        <button
          type="button"
          onClick={() => test("user")}
          disabled={firing !== "idle"}
          className="group flex items-center gap-4 rounded-2xl border border-sky-200 bg-sky-50/60 px-5 py-4 text-left transition hover:border-sky-400 hover:bg-sky-50 disabled:opacity-60"
        >
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-500 text-white transition-transform ${firing === "user" ? "scale-110" : "group-hover:scale-105"}`}
          >
            <Volume2 className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-sky-800">
              {firing === "user" ? "Playing…" : "New User Registration"}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">Bright two-tone ascending chime (880 → 1100 Hz)</p>
          </div>
        </button>

        {/* New Slyder Lead chime */}
        <button
          type="button"
          onClick={() => test("lead")}
          disabled={firing !== "idle"}
          className="group flex items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 px-5 py-4 text-left transition hover:border-emerald-400 hover:bg-emerald-50 disabled:opacity-60"
        >
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white transition-transform ${firing === "lead" ? "scale-110" : "group-hover:scale-105"}`}
          >
            <Volume2 className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-emerald-800">
              {firing === "lead" ? "Playing…" : "New Slyder Lead"}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">Warm two-tone chime (660 → 880 Hz)</p>
          </div>
        </button>
      </div>

      <p className="mt-5 text-xs leading-6 text-slate-400">
        The dashboard polls for new activity every 20 seconds. Sounds only fire when the count increases — not on every poll. Your browser must allow audio (usually triggered by first interaction on the page).
      </p>
    </div>
  );
}
