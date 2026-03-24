"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";

export function NotificationTemplateEditor({
  template,
}: {
  template: {
    id: string;
    key: string;
    name: string;
    subject?: string;
    bodyTemplate: string;
    plainTextTemplate?: string;
    isActive: boolean;
    description?: string;
  };
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: template.name,
    subject: template.subject || "",
    bodyTemplate: template.bodyTemplate,
    plainTextTemplate: template.plainTextTemplate || "",
    description: template.description || "",
    isActive: template.isActive,
  });

  async function save() {
    setError(null);
    const response = await fetch(`/api/admin/notifications/templates/${template.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-slyde-admin-key": "dev-admin-key" },
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      setError("Could not update notification template.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="surface-panel p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="field-shell">
          <span className="field-label">Template key</span>
          <input className="field-input" value={template.key} disabled />
        </label>
        <label className="field-shell">
          <span className="field-label">Active</span>
          <select className="field-input" value={`${form.isActive}`} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.value === "true" }))}>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </label>
        <label className="field-shell md:col-span-2">
          <span className="field-label">Template name</span>
          <input className="field-input" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
        </label>
        <label className="field-shell md:col-span-2">
          <span className="field-label">Email subject</span>
          <input className="field-input" value={form.subject} onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))} />
        </label>
        <label className="field-shell md:col-span-2">
          <span className="field-label">Description</span>
          <textarea className="field-input min-h-24" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
        </label>
        <label className="field-shell md:col-span-2">
          <span className="field-label">Body template</span>
          <textarea className="field-input min-h-[260px]" value={form.bodyTemplate} onChange={(event) => setForm((current) => ({ ...current, bodyTemplate: event.target.value }))} />
        </label>
        <label className="field-shell md:col-span-2">
          <span className="field-label">Plain text template</span>
          <textarea className="field-input min-h-32" value={form.plainTextTemplate} onChange={(event) => setForm((current) => ({ ...current, plainTextTemplate: event.target.value }))} />
        </label>
      </div>

      {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}

      <div className="mt-6 flex gap-3">
        <Button type="button" disabled={pending} onClick={() => startTransition(() => void save())}>
          {pending ? "Saving..." : "Save template"}
        </Button>
      </div>
    </div>
  );
}

