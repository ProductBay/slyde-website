import { ArrowRight, BadgeCheck, MessageCircle } from "lucide-react";
import { LinkButton } from "@/components/ui/link-button";

export function BrandingBannerStrip() {
  return (
    <section className="section-shell py-6">
      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 shadow-panel">
        <div className="grid gap-0 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="p-5 sm:p-6 lg:p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
                <BadgeCheck className="h-6 w-6" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                  Verified branding starts with interest
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  Pick the branding style that fits how you move.
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                  Whether you use a bike, car, van, delivery box, helmet, or walker setup, SLYDE will guide eligible Slyders toward practical branding options by WhatsApp.
                </p>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 p-5 sm:p-6 lg:border-l lg:border-t-0 lg:p-7">
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <LinkButton href="#branding-interest-form" className="min-w-52 justify-center" icon={<MessageCircle className="h-4 w-4" />}>
                Request Branding Info
              </LinkButton>
              <LinkButton href="#branding-options" variant="ghost" className="min-w-52 justify-center" icon={<ArrowRight className="h-4 w-4" />}>
                View Options
              </LinkButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
