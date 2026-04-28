"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Download, MonitorSmartphone, Shield, Store, UserRound, UsersRound, X } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const portalOptions = [
  {
    label: "Slyder Portal",
    href: "/slyder/login?install=1",
    description: "Onboarding and Slyder account access.",
    icon: UserRound,
  },
  {
    label: "Merchant Portal",
    href: "/merchant/login?install=1",
    description: "Dispatch, orders, tracking, and settings.",
    icon: Store,
  },
  {
    label: "Admin Console",
    href: "/admin/login?install=1",
    description: "Operations and platform controls.",
    icon: Shield,
  },
  {
    label: "Employee Portal",
    href: "/employee/login?install=1",
    description: "Employee onboarding and workspace access.",
    icon: UsersRound,
  },
];

const portalInstallCopy: Record<string, { title: string; description: string; storageKey: string }> = {
  "/slyder/login": {
    title: "Install the Slyder portal",
    description: "Open SLYDE directly to your Slyder login, onboarding, and setup screens.",
    storageKey: "slyde-slyder-install-dismissed",
  },
  "/merchant/login": {
    title: "Install the merchant portal",
    description: "Open SLYDE directly to dispatch, orders, tracking, and merchant tools.",
    storageKey: "slyde-merchant-install-dismissed",
  },
  "/admin/login": {
    title: "Install the admin console",
    description: "Open SLYDE directly to operations, applications, and control tower tools.",
    storageKey: "slyde-admin-install-dismissed",
  },
  "/employee/login": {
    title: "Install the employee portal",
    description: "Open SLYDE directly to employee onboarding, guides, and workspace tools.",
    storageKey: "slyde-employee-install-dismissed",
  },
};

function isStandaloneMode() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(display-mode: standalone)").matches || Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
}

export function WebAppInstallPrompt() {
  const pathname = usePathname();
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [canShow, setCanShow] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  const portalCopy = portalInstallCopy[pathname];
  const isHome = pathname === "/";
  const isPortalInstallPage = Boolean(portalCopy);
  const storageKey = portalCopy?.storageKey ?? "slyde-web-app-install-dismissed";

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);

  useEffect(() => {
    setIsStandalone(isStandaloneMode());
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
      setCanShow(true);
    };

    const handleInstalled = () => {
      window.localStorage.setItem(storageKey, "true");
      setCanShow(false);
      setInstallEvent(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, [storageKey]);

  useEffect(() => {
    const dismissed = window.localStorage.getItem(storageKey) === "true";
    const hasInstallIntent = new URLSearchParams(window.location.search).get("install") === "1";
    setCanShow((isHome || isPortalInstallPage || hasInstallIntent) && !dismissed);
  }, [isHome, isPortalInstallPage, storageKey]);

  const installLabel = useMemo(() => {
    if (portalCopy) {
      return "Install portal";
    }

    return "Install SLYDE";
  }, [portalCopy]);

  const dismiss = useCallback(() => {
    window.localStorage.setItem(storageKey, "true");
    setCanShow(false);
  }, [storageKey]);

  const handleInstall = async () => {
    if (!installEvent) {
      return;
    }

    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") {
      window.localStorage.setItem(storageKey, "true");
      setCanShow(false);
    }
  };

  useEffect(() => {
    if (isStandalone || !canShow || (!isHome && !isPortalInstallPage)) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        dismiss();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [canShow, dismiss, isHome, isPortalInstallPage, isStandalone]);

  if (isStandalone || !canShow || (!isHome && !isPortalInstallPage)) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center px-4 py-6 sm:px-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="slyde-web-app-install-title"
      onClick={dismiss}
    >
      <div className="absolute inset-0 bg-slate-950/58 backdrop-blur-[5px]" aria-hidden />
      <div
        className="relative max-h-[calc(100dvh-2rem)] w-full max-w-[34rem] overflow-y-auto rounded-[1.65rem] border border-white/20 bg-white shadow-[0_30px_90px_-42px_rgba(2,6,23,0.85)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-4 border-b border-slate-100 bg-slate-950 px-5 py-5 text-white sm:px-6">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
            <MonitorSmartphone className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">SLYDE Web App</p>
            <h2 id="slyde-web-app-install-title" className="mt-1 text-xl font-semibold leading-7 sm:text-2xl">
              {portalCopy?.title ?? "Download SLYDE to your device"}
            </h2>
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Close web app install prompt"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white transition hover:bg-white/15"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <p className="text-sm leading-7 text-slate-600 sm:text-[0.95rem]">
            {portalCopy?.description ??
              "Install SLYDE as a web app for faster access to applications, tracking, support, and login portals."}
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleInstall}
              disabled={!installEvent}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-600"
            >
              <Download className="h-4 w-4" />
              {installEvent ? installLabel : "Use browser install"}
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="inline-flex h-12 items-center justify-center rounded-full border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Not now
            </button>
          </div>

          {isHome ? (
            <div className="grid gap-3 border-t border-slate-100 pt-5">
              {portalOptions.map(({ label, href, description, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:border-sky-200 hover:bg-sky-50"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-sky-700 shadow-sm">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-slate-950">{label}</span>
                    <span className="mt-0.5 block text-xs leading-5 text-slate-500">{description}</span>
                  </span>
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
