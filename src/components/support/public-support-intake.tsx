"use client";

import { startTransition, useState } from "react";
import { Button } from "@/components/ui/button";

export function PublicSupportIntake() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  function submit() {
    setPending(true);
    setStatus(null);
    startTransition(async () => {
      const response = await fetch("/api/support/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: "public",
          channel: "web_chat",
          subject,
          message,
          contact: {
            fullName,
            email,
          },
        }),
      });
      const payload = await response.json().catch(() => null);
      setPending(false);
      if (response.ok && payload?.id) {
        setStatus(`Support request created. Track it at /support/track/${payload.id}`);
        setSubject("");
        setMessage("");
      } else {
        setStatus(typeof payload?.error === "string" ? payload.error : "Unable to submit support request.");
      }
    });
  }

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft">
      <h2 className="text-xl font-semibold text-slate-950">Create a support request</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Use this form when you need help from SLYDE and want a written support record you can track afterward.
      </p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <input className="field-input" placeholder="Full name" value={fullName} onChange={(event) => setFullName(event.target.value)} />
        <input className="field-input" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <input className="field-input md:col-span-2" placeholder="Subject" value={subject} onChange={(event) => setSubject(event.target.value)} />
        <textarea
          className="field-input min-h-36 md:col-span-2"
          placeholder="Tell SLYDE what happened and what help you need next."
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
      </div>
      {status ? <p className="mt-4 text-sm text-slate-600">{status}</p> : null}
      <div className="mt-5">
        <Button type="button" onClick={submit} disabled={pending}>
          {pending ? "Submitting..." : "Submit support request"}
        </Button>
      </div>
    </div>
  );
}
