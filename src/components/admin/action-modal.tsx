"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";

type ModalKind = "approve" | "reject" | "request-documents" | "zone" | "resend" | "employee-invite";

export function ActionModal({
  triggerLabel,
  title,
  description,
  endpoint,
  method = "POST",
  payload,
  confirmLabel,
  kind,
}: {
  triggerLabel: string;
  title: string;
  description: string;
  endpoint: string;
  method?: "POST" | "PATCH";
  payload: Record<string, unknown>;
  confirmLabel: string;
  kind: ModalKind;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [resultOpen, setResultOpen] = useState(false);
  const [resultTitle, setResultTitle] = useState("");
  const [resultMessage, setResultMessage] = useState("");
  const [resultTone, setResultTone] = useState<"success" | "error">("success");
  const [note, setNote] = useState("");
  const [reason, setReason] = useState("");
  const [requestedItems, setRequestedItems] = useState("national_id, profile_photo");

  const finalPayload =
    kind === "approve"
      ? { ...payload, reviewNotes: note || undefined }
      : kind === "employee-invite"
        ? { ...payload, reviewNotes: note || undefined }
      : kind === "reject"
        ? { ...payload, reason: reason || "Rejected by admin review" }
        : kind === "request-documents"
          ? {
              ...payload,
              notes: note || "Please upload the requested items to continue review.",
              requestedDocumentTypes: requestedItems.split(",").map((item) => item.trim()).filter(Boolean),
            }
          : payload;

  const successMessage =
    kind === "approve"
      ? "The application was approved and the Slyder activation flow has been started."
      : kind === "employee-invite"
        ? "The employee invite was sent and activation has been started."
      : kind === "reject"
        ? "The application was rejected successfully."
        : kind === "request-documents"
          ? "The applicant has been notified that more documents are required."
          : kind === "zone"
            ? "The launch-control action completed successfully."
            : "The notification action completed successfully.";

  return (
    <>
      <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(true)}>
        {triggerLabel}
      </Button>
      {open ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 px-4">
          <div className="surface-panel w-full max-w-lg p-6">
            <h2 className="text-2xl font-semibold text-slate-950">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
            {kind === "approve" || kind === "employee-invite" || kind === "request-documents" ? (
              <label className="field-shell mt-5 block">
                <span className="field-label">{kind === "request-documents" ? "Message or note" : "Internal review note"}</span>
                <textarea className="field-input min-h-28" value={note} onChange={(event) => setNote(event.target.value)} />
              </label>
            ) : null}
            {kind === "reject" ? (
              <label className="field-shell mt-5 block">
                <span className="field-label">Rejection reason</span>
                <textarea className="field-input min-h-28" value={reason} onChange={(event) => setReason(event.target.value)} />
              </label>
            ) : null}
            {kind === "request-documents" ? (
              <label className="field-shell mt-5 block">
                <span className="field-label">Requested items</span>
                <input className="field-input" value={requestedItems} onChange={(event) => setRequestedItems(event.target.value)} />
              </label>
            ) : null}
            {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    setError(null);
                    const response = await fetch(endpoint, {
                      method,
                      headers: { "Content-Type": "application/json", "x-slyde-admin-key": "dev-admin-key" },
                      body: JSON.stringify(finalPayload),
                    });
                    const responseText = await response.text();

                    if (!response.ok) {
                      let message = responseText || "Action failed";
                      try {
                        const parsed = JSON.parse(responseText) as { error?: string };
                        message = parsed.error || message;
                      } catch {}
                      setError(message);
                      setResultTone("error");
                      setResultTitle("Action failed");
                      setResultMessage(message);
                      setResultOpen(true);
                      return;
                    }

                    let message = successMessage;
                    let tone: "success" | "error" = "success";
                    let title = "Action completed";
                    try {
                      const parsed = JSON.parse(responseText) as {
                        message?: string;
                        ok?: boolean;
                        appSync?: { status?: string; error?: string };
                      };
                      if (parsed.message) {
                        message = parsed.message;
                      }
                      if (parsed.appSync?.status === "failed") {
                        tone = "error";
                        title = "Action completed with warning";
                      }
                    } catch {}

                    setOpen(false);
                    setResultTone(tone);
                    setResultTitle(title);
                    setResultMessage(message);
                    setResultOpen(true);
                    router.refresh();
                  })
                }
              >
                {pending ? "Working..." : confirmLabel}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
      {resultOpen ? (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/55 px-4">
          <div className="surface-panel w-full max-w-md p-6">
            <div
              className={`rounded-2xl border px-4 py-3 text-sm ${
                resultTone === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-rose-200 bg-rose-50 text-rose-800"
              }`}
            >
              {resultTone === "success" ? "Success" : "Error"}
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-slate-950">{resultTitle}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{resultMessage}</p>
            <div className="mt-6 flex justify-end">
              <Button type="button" onClick={() => setResultOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
