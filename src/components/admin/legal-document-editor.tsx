"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import type { LegalDocumentType } from "@/types/backend/onboarding";

export function LegalDocumentEditor({
  mode,
  document,
}: {
  mode: "new" | "edit";
  document?: {
    id: string;
    documentType: LegalDocumentType;
    title: string;
    slug: string;
    version: string;
    summary?: string;
    excerpt?: string;
    effectiveFrom?: string;
    contentMarkdown: string;
    status: string;
    isActive: boolean;
  };
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    documentType: document?.documentType || "merchant_privacy_notice",
    title: document?.title || "",
    slug: document?.slug || "",
    version: document?.version || "",
    summary: document?.summary || "",
    excerpt: document?.excerpt || "",
    effectiveFrom: document?.effectiveFrom || "",
    contentMarkdown: document?.contentMarkdown || "",
  });

  async function submit() {
    setError(null);
    const endpoint = mode === "new" ? "/api/admin/legal-documents" : `/api/admin/legal-documents/${document?.id}`;
    const method = mode === "new" ? "POST" : "PATCH";
    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json", "x-slyde-admin-key": "dev-admin-key" },
      body: JSON.stringify(form),
    });
    if (!response.ok) {
      setError("Could not save legal document.");
      return;
    }
    const saved = await response.json();
    router.push(`/admin/legal-documents/${saved.id || saved.document?.id || document?.id}`);
    router.refresh();
  }

  async function action(path: string) {
    setError(null);
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-slyde-admin-key": "dev-admin-key" },
      body: JSON.stringify({}),
    });
    if (!response.ok) {
      setError("Could not complete legal document action.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="surface-panel p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="field-shell">
          <span className="field-label">Document type</span>
          <select className="field-input" value={form.documentType} onChange={(event) => setForm((current) => ({ ...current, documentType: event.target.value as LegalDocumentType }))} disabled={mode === "edit"}>
            <option value="slyder_privacy_notice">Slyder Privacy Notice</option>
            <option value="slyder_onboarding_terms">Slyder Onboarding Terms</option>
            <option value="merchant_privacy_notice">Merchant Privacy Notice</option>
            <option value="merchant_interest_terms">Merchant Interest Terms</option>
            <option value="website_privacy_policy">Website Privacy Policy</option>
            <option value="website_terms_of_use">Website Terms of Use</option>
          </select>
        </label>
        <label className="field-shell">
          <span className="field-label">Version</span>
          <input className="field-input" value={form.version} onChange={(event) => setForm((current) => ({ ...current, version: event.target.value }))} />
        </label>
        <label className="field-shell md:col-span-2">
          <span className="field-label">Title</span>
          <input className="field-input" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
        </label>
        <label className="field-shell md:col-span-2">
          <span className="field-label">Slug</span>
          <input className="field-input" value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} />
        </label>
        <label className="field-shell md:col-span-2">
          <span className="field-label">Summary</span>
          <textarea className="field-input min-h-24" value={form.summary} onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))} />
        </label>
        <label className="field-shell md:col-span-2">
          <span className="field-label">Excerpt</span>
          <textarea className="field-input min-h-24" value={form.excerpt} onChange={(event) => setForm((current) => ({ ...current, excerpt: event.target.value }))} />
        </label>
        <label className="field-shell md:col-span-2">
          <span className="field-label">Content</span>
          <textarea className="field-input min-h-[360px]" value={form.contentMarkdown} onChange={(event) => setForm((current) => ({ ...current, contentMarkdown: event.target.value }))} />
        </label>
      </div>
      {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}
      <div className="mt-6 flex flex-wrap gap-3">
        <Button type="button" disabled={pending} onClick={() => startTransition(() => void submit())}>
          {pending ? "Saving..." : mode === "new" ? "Create draft" : "Save draft"}
        </Button>
        {mode === "edit" && document ? (
          <>
            <Button type="button" variant="secondary" onClick={() => startTransition(() => void action(`/api/admin/legal-documents/${document.id}/publish`))}>
              Publish
            </Button>
            <Button type="button" variant="secondary" onClick={() => startTransition(() => void action(`/api/admin/legal-documents/${document.id}/activate`))}>
              Activate
            </Button>
            <Button type="button" variant="ghost" onClick={() => startTransition(() => void action(`/api/admin/legal-documents/${document.id}/archive`))}>
              Archive
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
}
