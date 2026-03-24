"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";

export function DocumentReviewCard({
  applicationId,
  document,
}: {
  applicationId: string;
  document: {
    id: string;
    type: string;
    fileName: string;
    fileUrl: string;
    previewAvailable?: boolean;
    uploadedAt: string;
    verificationStatus: string;
    rejectionReason?: string;
  };
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [resultOpen, setResultOpen] = useState(false);
  const [resultTone, setResultTone] = useState<"success" | "error">("success");
  const [resultMessage, setResultMessage] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const previewUrl = document.fileUrl.includes("?")
    ? `${document.fileUrl}&admin_key=dev-admin-key`
    : `${document.fileUrl}?admin_key=dev-admin-key`;

  function handleReplace(file: File) {
    startTransition(async () => {
      setError(null);
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`/api/admin/slyder-applications/${applicationId}/documents/${document.id}`, {
        method: "POST",
        headers: { "x-slyde-admin-key": "dev-admin-key" },
        body: formData,
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        const message = body?.error || "Document replacement failed.";
        setError(message);
        setResultTone("error");
        setResultMessage(message);
        setResultOpen(true);
        return;
      }

      setResultTone("success");
      setResultMessage("The document file was replaced successfully and the record has been reset to pending review.");
      setResultOpen(true);
      router.refresh();
    });
  }

  return (
    <div className="surface-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{document.type.replace(/_/g, " ")}</p>
            <p className="mt-1 font-semibold text-slate-950">{document.fileName}</p>
            <p className="mt-2 text-sm text-slate-500">{new Date(document.uploadedAt).toLocaleString("en-JM")}</p>
          </div>
        </div>
        <StatusBadge status={document.verificationStatus} />
      </div>
      {document.rejectionReason ? <p className="mt-4 text-sm leading-7 text-rose-600">{document.rejectionReason}</p> : null}
      {document.previewAvailable ? (
        <a href={previewUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex text-sm font-semibold text-sky-700">
          Preview document
        </a>
      ) : (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
          Preview unavailable on this server. Replace this file to repair the record.
        </div>
      )}
      <div className="mt-4 flex items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              void handleReplace(file);
            }
            event.target.value = "";
          }}
        />
        <Button type="button" size="sm" variant="secondary" disabled={pending} onClick={() => inputRef.current?.click()}>
          {pending ? "Replacing..." : "Replace file"}
        </Button>
      </div>
      {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
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
            <p className="mt-4 text-sm leading-7 text-slate-600">{resultMessage}</p>
            <div className="mt-6 flex justify-end">
              <Button type="button" onClick={() => setResultOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
