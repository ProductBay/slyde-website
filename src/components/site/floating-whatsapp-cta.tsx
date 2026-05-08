"use client";

import { MessageCircle } from "lucide-react";
import { track } from "@vercel/analytics";

const whatsappMessage =
  "Hi SLYDE \uD83D\uDC4B I\u2019m interested in becoming a Slyder. Please send me the next steps. https://slydenetwork.com/join/slyder";

const whatsappHref = `https://wa.me/18765947320?text=${encodeURIComponent(whatsappMessage)}`;

export function FloatingWhatsAppCta() {
  return (
    <div className="pointer-events-none fixed bottom-5 right-4 z-50 flex flex-col items-end gap-2 sm:bottom-6 sm:right-6">
      <div className="hidden rounded-full border border-emerald-100 bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-[0_14px_30px_-22px_rgba(15,23,42,0.45)] backdrop-blur sm:block">
        Questions? Chat with us
      </div>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with SLYDE on WhatsApp about becoming a Slyder"
        onClick={() => track("floating_whatsapp_cta_clicked")}
        className="group pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/20 bg-green-500 px-4 py-3 text-sm font-bold text-white shadow-[0_18px_36px_-18px_rgba(34,197,94,0.85)] transition duration-200 hover:-translate-y-0.5 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-offset-2"
      >
        <span className="relative inline-flex h-5 w-5 items-center justify-center">
          <span className="absolute inset-[-7px] rounded-full bg-green-300/30 opacity-0 transition group-hover:opacity-100 sm:animate-[whatsappPulse_2.4s_ease-out_infinite]" />
          <MessageCircle className="relative h-5 w-5" aria-hidden="true" />
        </span>
        <span className="hidden sm:inline">Join as a Slyder</span>
        <span className="sm:hidden">WhatsApp</span>
      </a>

      <style jsx>{`
        @keyframes whatsappPulse {
          0% {
            transform: scale(0.84);
            opacity: 0.45;
          }
          70% {
            transform: scale(1.55);
            opacity: 0;
          }
          100% {
            transform: scale(1.55);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
