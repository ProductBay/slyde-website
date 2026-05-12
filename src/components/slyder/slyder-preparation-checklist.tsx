"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";

const preparationItems = [
  "Valid government ID is easy to access",
  "TRN information is ready for final confirmation",
  "Phone has reliable data and enough battery for shifts",
  "WhatsApp and email notifications are turned on",
  "Courier bag, helmet, or delivery gear is ready if required",
  "Vehicle documents or bicycle/walker details are ready",
  "Payout account details are available for setup",
  "I understand GLYDE customer orders depend on SLYDE readiness and zone launch",
];

const storageKey = "slyde:slyder-preparation-checklist";

export function SlyderPreparationChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) setChecked(JSON.parse(saved));
    } catch {
      setChecked({});
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(checked));
    } catch {
      // Personal preparation state is only a browser convenience.
    }
  }, [checked]);

  const completed = useMemo(
    () => preparationItems.filter((item) => checked[item]).length,
    [checked],
  );
  const percent = Math.round((completed / preparationItems.length) * 100);

  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">Personal preparation</p>
          <h2 className="mt-2 text-lg font-semibold text-slate-950">Your Slyder prep checklist</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            This is for your own preparation. It does not replace SLYDE admin review or app onboarding requirements.
          </p>
        </div>
        <div className="rounded-2xl bg-slate-950 px-4 py-3 text-right text-white">
          <p className="text-2xl font-semibold">{percent}%</p>
          <p className="text-xs text-slate-300">prepared</p>
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${percent}%` }} />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {preparationItems.map((item) => {
          const active = Boolean(checked[item]);
          return (
            <label
              key={item}
              className={`flex min-h-16 items-start gap-3 rounded-2xl border px-4 py-3 text-sm leading-6 transition ${
                active ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-slate-50 text-slate-700"
              }`}
            >
              <input
                type="checkbox"
                className="field-checkbox mt-1"
                checked={active}
                onChange={(event) => setChecked((current) => ({ ...current, [item]: event.target.checked }))}
              />
              <span className="flex-1">{item}</span>
              {active ? <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" /> : null}
            </label>
          );
        })}
      </div>
    </section>
  );
}
