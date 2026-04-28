"use client";

import { createPortal } from "react-dom";
import { useEffect, useRef, useState, useTransition, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { StoredUser } from "@/types/backend/onboarding";

type QuickLink = { href: string; label: string; description: string; icon: string };

const quickLinks: QuickLink[] = [
  { href: "/account/residential", label: "Residential dashboard", description: "View wallet balance and dispatch progress.", icon: "🛡️" },
  { href: "/track", label: "Track a parcel", description: "Enter your tracking code to see live delivery status.", icon: "📦" },
  { href: "/refer", label: "Refer a friend", description: "Share your referral link and earn rewards.", icon: "🎁" },
  { href: "/support", label: "Get support", description: "Submit a request or browse help articles.", icon: "💬" },
  { href: "/coverage", label: "Coverage areas", description: "See which parishes and zones SLYDE serves.", icon: "📍" },
];

export function AccountDashboard({ user, initialAvatarUrl }: { user: StoredUser; initialAvatarUrl?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl ?? "");
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [trackingCodeInput, setTrackingCodeInput] = useState("");
  const [activeTrackingCode, setActiveTrackingCode] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isTrackModalOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsTrackModalOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isTrackModalOpen]);

  function handleSignOut() {
    startTransition(async () => {
      await fetch("/api/auth/user/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    });
  }

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError("");
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/auth/user/avatar", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        setUploadError(data.error ?? "Unable to upload profile photo");
        return;
      }

      setAvatarUrl(data.fileUrl);
      router.refresh();
    } catch {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function openTrackModal() {
    setTrackingCodeInput("");
    setActiveTrackingCode(null);
    setIsTrackModalOpen(true);
  }

  function closeTrackModal() {
    setIsTrackModalOpen(false);
  }

  function handleTrackSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedCode = trackingCodeInput.trim();
    if (!normalizedCode) return;
    setActiveTrackingCode(normalizedCode);
  }

  const initials = user.fullName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-6">
      {/* Profile card */}
      <div className="flex items-center justify-between rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
        <div className="flex items-center gap-4">
          <div className="relative h-14 w-14 shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={`${user.fullName} profile`}
                className="h-14 w-14 rounded-full border border-slate-200 object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-base font-bold text-white">
                {initials}
              </div>
            )}
          </div>
          <div>
            <p className="font-semibold text-slate-950">{user.fullName}</p>
            <p className="text-sm text-slate-500">{user.email}</p>
            {user.phone && <p className="text-xs text-slate-400">{user.phone}</p>}
            <div className="mt-2 flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60"
              >
                {isUploading ? "Uploading..." : avatarUrl ? "Change photo" : "Upload photo"}
              </button>
              <span className="text-[11px] text-slate-400">JPG, PNG or WEBP, up to 8MB</span>
            </div>
            {uploadError ? <p className="mt-2 text-xs text-red-600">{uploadError}</p> : null}
          </div>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={isPending}
          className="rounded-full border border-slate-200 px-4 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60"
        >
          {isPending ? "Signing out…" : "Sign out"}
        </button>
      </div>

      {/* Quick links */}
      <div>
        <h2 className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Quick links</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {quickLinks.map(({ href, label, description, icon }) => (
            href === "/track" ? (
              <button
                key={href}
                type="button"
                onClick={openTrackModal}
                className="flex items-start gap-3.5 rounded-[1.35rem] border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:border-slate-300 hover:bg-white"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-100 bg-white text-base shadow-sm">
                  {icon}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-950">{label}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{description}</p>
                </div>
              </button>
            ) : (
              <a
                key={href}
                href={href}
                className="flex items-start gap-3.5 rounded-[1.35rem] border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-slate-300 hover:bg-white"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-100 bg-white text-base shadow-sm">
                  {icon}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-950">{label}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{description}</p>
                </div>
              </a>
            )
          ))}
        </div>
      </div>

      {isTrackModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-end bg-slate-950/60 sm:items-center sm:justify-center sm:p-6"
            onClick={closeTrackModal}
          >
            <div
              className="flex w-full max-w-3xl flex-col overflow-hidden rounded-t-[1.5rem] bg-white shadow-2xl sm:rounded-[1.5rem]"
              style={{ maxHeight: "min(92dvh, 92vh)" }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
                <div>
                  <p className="text-sm font-semibold text-slate-950">Track a parcel</p>
                  <p className="text-xs text-slate-500">Enter a customer tracking code to view live status.</p>
                </div>
                <button
                  type="button"
                  onClick={closeTrackModal}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Close tracking modal"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleTrackSubmit} className="border-b border-slate-100 px-5 py-4 sm:px-6">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="text"
                    value={trackingCodeInput}
                    onChange={(event) => setTrackingCodeInput(event.target.value)}
                    placeholder="Enter tracking code (example: SLY-123456)"
                    className="w-full rounded-[0.9rem] border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  />
                  <button
                    type="submit"
                    className="rounded-[0.9rem] bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                  >
                    View status
                  </button>
                </div>
              </form>

              <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 px-5 py-4 sm:px-6">
                {activeTrackingCode ? (
                  <>
                    <iframe
                      title="Parcel tracking"
                      src={`/track/${encodeURIComponent(activeTrackingCode)}`}
                      className="h-[62vh] w-full rounded-[1rem] border border-slate-200 bg-white"
                    />
                    <a
                      href={`/track/${encodeURIComponent(activeTrackingCode)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex text-xs font-semibold text-sky-700 underline-offset-2 hover:underline"
                    >
                      Open in full page
                    </a>
                  </>
                ) : (
                  <div className="rounded-[1rem] border border-dashed border-slate-300 bg-white px-4 py-6 text-sm text-slate-500">
                    Enter a tracking code above to load the parcel timeline here.
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
