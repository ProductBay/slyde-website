"use client";

import { useState } from "react";
import { ShieldCheck, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  residentIdTypeLabels,
  residentIdTypes,
} from "@/modules/residential-intake/schemas/residential-intake.schemas";

type KycStatus = "not_submitted" | "pending_review" | "approved" | "rejected" | "resubmission_required";

const statusText: Record<KycStatus, string> = {
  not_submitted: "Not submitted",
  pending_review: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
  resubmission_required: "Resubmission required",
};

export function ResidentKycForm(props: {
  status: KycStatus;
  reviewNotes?: string | null;
  submittedAt?: string | null;
}) {
  const [trn, setTrn] = useState("");
  const [idType, setIdType] = useState<(typeof residentIdTypes)[number] | "">("");
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const blocked = props.status === "approved" || props.status === "pending_review";

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!trn || !idType || !idDocument) {
      setError("TRN, ID type, and ID document are required.");
      return;
    }

    const payload = new FormData();
    payload.set("trn", trn.trim());
    payload.set("idType", idType);
    payload.set("idDocument", idDocument);

    setSubmitting(true);
    try {
      const response = await fetch("/api/account/residential/kyc", {
        method: "POST",
        body: payload,
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data?.error || "Unable to submit verification details.");
        return;
      }
      setSuccess("Verification details submitted. Our team will review and notify you.");
      setTrn("");
      setIdType("");
      setIdDocument(null);
    } catch {
      setError("Something went wrong while submitting your details.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="surface-panel rounded-2xl p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Resident Verification</h2>
          <p className="mt-1 text-sm text-slate-600">
            To protect residents and drivers, account verification is required before dispatch approval.
          </p>
        </div>
        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          {statusText[props.status]}
        </div>
      </div>

      {props.submittedAt ? (
        <p className="text-xs text-slate-500">Submitted: {new Date(props.submittedAt).toLocaleString()}</p>
      ) : null}

      {props.reviewNotes ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <strong>Review note:</strong> {props.reviewNotes}
        </div>
      ) : null}

      {props.status === "approved" ? (
        <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          <ShieldCheck className="mt-0.5 h-4 w-4" />
          <span>Your residential account is verified. You can now submit dispatch requests.</span>
        </div>
      ) : null}

      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 text-sm text-slate-700">
            <span className="font-medium">TRN</span>
            <input
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-sky-200 transition focus:ring"
              value={trn}
              onChange={(event) => setTrn(event.target.value.replace(/\D/g, "").slice(0, 9))}
              placeholder="9-digit TRN"
              inputMode="numeric"
              maxLength={9}
              disabled={blocked || submitting}
              required
            />
          </label>

          <label className="space-y-1 text-sm text-slate-700">
            <span className="font-medium">ID Type</span>
            <select
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-sky-200 transition focus:ring"
              value={idType}
              onChange={(event) => setIdType(event.target.value as (typeof residentIdTypes)[number])}
              disabled={blocked || submitting}
              required
            >
              <option value="">Select ID type</option>
              {residentIdTypes.map((type) => (
                <option key={type} value={type}>
                  {residentIdTypeLabels[type]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="space-y-1 text-sm text-slate-700 block">
          <span className="font-medium">ID Document Upload (PDF, JPG, PNG, WEBP)</span>
          <input
            type="file"
            className="w-full rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm text-slate-700"
            accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
            onChange={(event) => setIdDocument(event.target.files?.[0] ?? null)}
            disabled={blocked || submitting}
            required
          />
        </label>

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        {success ? <p className="text-sm text-emerald-700">{success}</p> : null}

        <Button type="submit" disabled={blocked || submitting} className="gap-2">
          <UploadCloud className="h-4 w-4" />
          {submitting ? "Submitting..." : "Submit Verification"}
        </Button>
      </form>
    </section>
  );
}
