"use client";

import { track } from "@vercel/analytics";
import Image from "next/image";

const whatsappMessage =
  "Hi SLYDE \uD83D\uDC4B I\u2019m interested in becoming a Slyder. Please send me the next steps. https://slydenetwork.com/join/slyder";

const whatsappHref = `https://wa.me/18765947320?text=${encodeURIComponent(whatsappMessage)}`;

export function FloatingWhatsAppCta() {
  return (
    <div className="pointer-events-none fixed bottom-5 right-4 z-50 flex flex-col items-end gap-2 sm:bottom-6 sm:right-6">
      <div className="hidden rounded-full border border-emerald-100 bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-[0_14px_30px_-22px_rgba(15,23,42,0.45)] backdrop-blur md:block">
        Questions? Chat with Glide
      </div>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with SLYDE on WhatsApp about becoming a Slyder"
        onClick={() => track("floating_whatsapp_cta_clicked")}
        className="group pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/70 bg-white px-2 py-2 pr-3 text-sm font-bold text-slate-950 shadow-[0_20px_45px_-20px_rgba(15,23,42,0.5)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_52px_-22px_rgba(34,197,94,0.65)] focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-offset-2"
      >
        <span className="relative inline-flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-900/10 bg-slate-950 sm:h-16 sm:w-16">
          <span className="absolute inset-[-8px] rounded-full bg-green-300/25 opacity-0 transition group-hover:opacity-100 sm:animate-[whatsappPulse_2.6s_ease-out_infinite]" />
          <Image
            src="/images/glide-whatsapp-cta.png"
            alt=""
            width={96}
            height={96}
            className="relative h-full w-full scale-[1.9] object-cover object-[50%_24%]"
            priority={false}
            aria-hidden="true"
          />
          <span className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-green-500 text-[9px] font-black leading-none text-white shadow-md">
            WA
          </span>
        </span>
        <span className="hidden pr-1 sm:inline">Join as a Slyder</span>
        <span className="pr-1 sm:hidden">WhatsApp</span>
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
