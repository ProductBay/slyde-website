"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type LegalDoc = {
  id: string;
  title: string;
  slug: string;
  version: string;
  documentType: string;
};

export function LegalAcceptancePanel({ documents }: { documents: LegalDoc[] }) {
  const [acceptedDocumentTypes, setAcceptedDocumentTypes] = useState<string[]>([]);
  const [understandZoneDependency, setUnderstandZoneDependency] = useState(false);
  const [understandSetupRequired, setUnderstandSetupRequired] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function toggle(type: string, checked: boolean) {
    setAcceptedDocumentTypes((current) =>
      checked ? Array.from(new Set([...current, type])) : current.filter((item) => item !== type),
    );
  }

  async function handleSubmit() {
    setPending(true);
    setError(null);

    const response = await fetch("/api/slyder/onboarding/accept-legal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        acceptedDocumentTypes,
        understandZoneDependency,
        understandSetupRequired,
      }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setPending(false);
      setError(payload.error?.formErrors?.[0] || payload.error || "You must accept the required legal documents before continuing.");
      return;
    }

    window.location.assign("/slyder/onboarding/setup");
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {documents.map((document) => (
          <label key={document.id} className="rounded-[1.5rem] border border-slate-200 bg-surface-1 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-lg font-semibold text-slate-950">{document.title}</p>
                <p className="mt-2 text-sm text-slate-500">Version {document.version}</p>
                <Link href={`/legal/${document.slug}`} target="_blank" className="mt-3 inline-flex text-sm font-semibold text-sky-700">
                  Open document
                </Link>
              </div>
              <input
                type="checkbox"
                className="field-checkbox"
                checked={acceptedDocumentTypes.includes(document.documentType)}
                onChange={(event) => toggle(document.documentType, event.target.checked)}
              />
            </div>
          </label>
        ))}
      </div>

      <div className="grid gap-3">
        <label className="flex items-start gap-3 rounded-3xl border border-slate-200 bg-surface-1 px-4 py-4">
          <input type="checkbox" className="field-checkbox mt-1" checked={understandZoneDependency} onChange={(event) => setUnderstandZoneDependency(event.target.checked)} />
          <span className="text-sm leading-7 text-slate-700">I understand that activation does not guarantee immediate work if my area is not yet live.</span>
        </label>
        <label className="flex items-start gap-3 rounded-3xl border border-slate-200 bg-surface-1 px-4 py-4">
          <input type="checkbox" className="field-checkbox mt-1" checked={understandSetupRequired} onChange={(event) => setUnderstandSetupRequired(event.target.checked)} />
          <span className="text-sm leading-7 text-slate-700">I understand I must complete setup and readiness before I can go online.</span>
        </label>
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <div>
        <Button type="button" onClick={() => void handleSubmit()} disabled={pending}>
          {pending ? "Saving..." : "Accept terms and continue"}
        </Button>
      </div>
    </div>
  );
}
