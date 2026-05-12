import Image from "next/image";
import { LinkButton } from "@/components/ui/link-button";

export function ForBusinessesHero() {
  return (
    <section className="section-shell py-8 sm:py-12">
      <div className="relative overflow-hidden rounded-[2.25rem] border border-white/35 shadow-panel">
        <Image
          src="/images/hero-businesses.jpg"
          alt="Business owner preparing customer orders while SLYDE supports delivery operations"
          fill
          priority
          className="business-hero-image object-cover object-center"
        />
        <div
          aria-hidden
          className="business-hero-overlay absolute inset-0 bg-[linear-gradient(110deg,rgba(3,12,26,0.90)_3%,rgba(3,12,26,0.73)_42%,rgba(2,132,199,0.30)_100%)]"
        />
        <div
          aria-hidden
          className="business-hero-glow absolute inset-0 bg-[radial-gradient(circle_at_88%_14%,rgba(45,212,191,0.28),transparent_34%)]"
        />

        <div className="relative px-6 py-9 sm:px-8 sm:py-12 lg:px-10 lg:py-14">
          <div className="max-w-4xl">
            <p className="inline-flex rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-100 backdrop-blur">
              Merchant Onboarding
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              Build sales momentum while SLYDE runs dependable delivery execution.
            </h1>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-sky-50/95 sm:text-lg sm:leading-8">
              Whether you are selling from social channels or scaling structured operations, choose a merchant path with
              clear tier boundaries, a 60-day free trial, and a practical upgrade route as your volume grows.
            </p>

            <div className="mt-5 grid gap-2 sm:inline-flex sm:flex-wrap sm:gap-3">
              {[
                "60-day free trial",
                "Merchant Lite to Business upgrade path",
                "Clear workflow for social and business sellers",
              ].map((item) => (
                <span
                  key={item}
                  className="inline-flex rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-medium text-slate-100 backdrop-blur"
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <LinkButton href="/for-businesses/grabquik">Grow with GrabQuik</LinkButton>
              <LinkButton href="/for-businesses/slyde" variant="secondary">Use SLYDE for Delivery</LinkButton>
              <LinkButton href="/for-businesses/status" variant="secondary">Check Application Status</LinkButton>
            </div>

            <div className="mt-5 inline-flex rounded-full border border-sky-200/50 bg-sky-100/15 px-4 py-2 text-xs text-sky-50 sm:text-sm">
              Already submitted a merchant application? Track your review status in real time.
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-[1.35rem] border border-slate-200 bg-white/95 p-4 shadow-soft backdrop-blur sm:mt-5 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Ready to choose your launch path?</p>
            <p className="mt-1 text-sm leading-6 text-slate-600 sm:text-base">
              Start with the track that matches your current operation and move faster with a clearer onboarding decision.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <LinkButton href="/for-businesses/apply/slyde">Start Delivery Onboarding</LinkButton>
            <LinkButton href="/for-businesses/grabquik" variant="secondary">Compare Growth Path</LinkButton>
            <LinkButton href="/for-businesses/status" variant="secondary">Track Application</LinkButton>
          </div>
        </div>
      </div>
    </section>
  );
}
