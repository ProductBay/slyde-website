"use client";

import { useState, startTransition } from "react";
import { Button } from "@/components/ui/button";

export function EmployeeApplicationForm() {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    roleInterest: "",
    departmentInterest: "logistics",
    employmentType: "full_time",
    location: "",
    experienceSummary: "",
    managerTrackInterest: false,
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function submit() {
    setPending(true);
    setError(null);
    setMessage(null);

    startTransition(async () => {
      const response = await fetch("/api/public/employee-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setPending(false);
        setError(body?.error ?? "Unable to submit application.");
        return;
      }

      setPending(false);
      setMessage("Application submitted. SLYDE can now review your employee application and send an activation invite if you are selected to move forward.");
    });
  }

  return (
    <div className="employee-paper max-w-4xl p-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Employee application</p>
        <h2 className="text-3xl font-semibold tracking-tight text-slate-950">Apply for a SLYDE employee role</h2>
        <p className="text-sm leading-7 text-slate-600">
          This path is for internal staff roles such as logistics operations, support, supervisors, and managers. It is separate from the Slyder courier application.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="field-shell">
          <span className="field-label">Full name</span>
          <input className="field-input" value={form.fullName} onChange={(event) => update("fullName", event.target.value)} />
        </label>
        <label className="field-shell">
          <span className="field-label">Email</span>
          <input className="field-input" type="email" value={form.email} onChange={(event) => update("email", event.target.value)} />
        </label>
        <label className="field-shell">
          <span className="field-label">Phone</span>
          <input className="field-input" value={form.phone} onChange={(event) => update("phone", event.target.value)} />
        </label>
        <label className="field-shell">
          <span className="field-label">Desired role</span>
          <input className="field-input" value={form.roleInterest} onChange={(event) => update("roleInterest", event.target.value)} placeholder="Example: Logistics Operations Associate" />
        </label>
        <label className="field-shell">
          <span className="field-label">Department</span>
          <select className="field-input" value={form.departmentInterest} onChange={(event) => update("departmentInterest", event.target.value as typeof form.departmentInterest)}>
            <option value="logistics">Logistics</option>
            <option value="operations">Operations</option>
            <option value="support">Support</option>
            <option value="finance">Finance</option>
            <option value="hr">HR</option>
            <option value="leadership">Leadership</option>
          </select>
        </label>
        <label className="field-shell">
          <span className="field-label">Employment type</span>
          <select className="field-input" value={form.employmentType} onChange={(event) => update("employmentType", event.target.value as typeof form.employmentType)}>
            <option value="full_time">Full-time</option>
            <option value="part_time">Part-time</option>
            <option value="contract">Contract</option>
          </select>
        </label>
        <label className="field-shell md:col-span-2">
          <span className="field-label">Primary location</span>
          <input className="field-input" value={form.location} onChange={(event) => update("location", event.target.value)} placeholder="Example: Kingston" />
        </label>
        <label className="field-shell md:col-span-2">
          <span className="field-label">Experience summary</span>
          <textarea className="field-input min-h-32" value={form.experienceSummary} onChange={(event) => update("experienceSummary", event.target.value)} />
        </label>
      </div>

      <label className="mt-5 flex items-center gap-3 text-sm text-slate-700">
        <input className="field-checkbox" type="checkbox" checked={form.managerTrackInterest} onChange={(event) => update("managerTrackInterest", event.target.checked)} />
        <span>I am also interested in supervisor or manager-track consideration.</span>
      </label>

      {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}
      {message ? <p className="mt-4 text-sm text-emerald-700">{message}</p> : null}

      <div className="mt-6">
        <Button type="button" onClick={submit} disabled={pending}>
          {pending ? "Submitting..." : "Submit employee application"}
        </Button>
      </div>
    </div>
  );
}
