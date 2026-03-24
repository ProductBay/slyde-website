"use client";

import { useState, type ChangeEvent } from "react";

export type FileMeta = {
  name: string;
  size: number;
  type: string;
  fileUrl?: string;
  storageKey?: string;
};

export function filesToMetaList(fileList: FileList | null): FileMeta[] {
  return Array.from(fileList ?? []).map((file) => ({
    name: file.name,
    size: file.size,
    type: file.type || "application/octet-stream",
  }));
}

export function FileUploadField({
  label,
  required,
  value,
  error,
  onChange,
}: {
  label: string;
  required?: boolean;
  value: FileMeta[];
  error?: string;
  onChange: (files: FileMeta[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);
    if (selectedFiles.length === 0) {
      onChange([]);
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => formData.append("files", file));

      const response = await fetch("/api/public/uploads/slyder-documents", {
        method: "POST",
        body: formData,
      });

      const json = (await response.json().catch(() => null)) as { files?: FileMeta[]; error?: string } | null;

      if (!response.ok || !json?.files) {
        throw new Error(json?.error || "Upload failed.");
      }

      const completedUploads = json.files.filter((file) => file.fileUrl && file.storageKey);
      if (completedUploads.length !== json.files.length) {
        throw new Error("Upload response was incomplete. Please try again.");
      }

      onChange(completedUploads);
      event.target.value = "";
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <label className="field-shell">
      <span className="field-label">
        {label}
        {required ? " *" : ""}
      </span>
      <input
        type="file"
        multiple
        accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
        className="field-input cursor-pointer file:mr-3 file:rounded-full file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
        onChange={handleChange}
      />
      {uploading ? <p className="text-sm text-slate-500">Uploading files...</p> : null}
      {value.length ? (
        <div className="rounded-2xl border border-border bg-surface-1 px-4 py-3 text-sm text-slate-600">
          {value.map((file) => file.name).join(", ")}
        </div>
      ) : null}
      {uploadError ? <p className="text-sm text-rose-600">{uploadError}</p> : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </label>
  );
}
