"use client";

import Script from "next/script";
import { useEffect, useId, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
        },
      ) => string;
      reset?: (widgetId?: string) => void;
      remove?: (widgetId?: string) => void;
    };
  }
}

export function TurnstileWidget({
  onToken,
}: {
  onToken: (token: string | null) => void;
}) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const [scriptReady, setScriptReady] = useState(false);
  const [scriptError, setScriptError] = useState(false);
  const widgetIdRef = useRef<string | null>(null);
  const containerId = useId().replace(/:/g, "");

  useEffect(() => {
    if (!siteKey || !scriptReady || !window.turnstile || widgetIdRef.current) return;

    widgetIdRef.current = window.turnstile.render(`#${containerId}`, {
      sitekey: siteKey,
      callback: (token) => onToken(token),
      "expired-callback": () => onToken(null),
      "error-callback": () => onToken(null),
      theme: "light",
    });

    return () => {
      if (widgetIdRef.current && window.turnstile?.remove) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [containerId, onToken, scriptReady, siteKey]);

  const missingSiteKey = !siteKey;
  const securityUnavailable = missingSiteKey || scriptError;

  return (
    <div className="field-shell">
      <span className="field-label">Bot protection</span>
      {!missingSiteKey ? (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="afterInteractive"
          onLoad={() => setScriptReady(true)}
          onError={() => {
            setScriptError(true);
            onToken(null);
          }}
        />
      ) : null}

      {!securityUnavailable ? <div id={containerId} className="min-h-[65px]" /> : null}

      {missingSiteKey ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-6 text-amber-800">
          Security check is currently unavailable because Turnstile is not configured.
        </p>
      ) : null}

      {scriptError ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-6 text-amber-800">
          Security check failed to load. Please disable content blockers for this page and refresh.
        </p>
      ) : null}

      {!securityUnavailable && !scriptReady ? (
        <p className="text-xs leading-6 text-slate-500">Loading security check...</p>
      ) : null}

      <p className="text-xs leading-6 text-slate-500">This helps protect public SLYDE intake routes from automated abuse.</p>
    </div>
  );
}
