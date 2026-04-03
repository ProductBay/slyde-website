import { LinkButton } from "@/components/ui/link-button";

export function ForBusinessesHero() {
  return (
    <section className="section-shell py-12 sm:py-16">
      <div className="relative overflow-hidden rounded-[2.25rem] border border-white/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.97),rgba(238,246,252,0.92))] px-6 py-10 shadow-panel sm:px-8 lg:px-10">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-sky-100/90 via-transparent to-cyan-100/70" />
        <div className="relative max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">Merchant Onboarding</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Start with the merchant path that actually fits your business.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
            Some businesses need storefront growth through GrabQuik. Others already have their customers and only need
            dependable delivery operations through SLYDE. Choose the right track now, then upgrade later if your
            operation expands.
          </p>
          <div className="mt-5 inline-flex rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm text-sky-900">
            Already submitted a merchant application? Track your review status here.
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <LinkButton href="/for-businesses/grabquik">Grow with GrabQuik</LinkButton>
            <LinkButton href="/for-businesses/slyde" variant="secondary">Use SLYDE for Delivery</LinkButton>
            <LinkButton href="/for-businesses/status" variant="secondary">Check Application Status</LinkButton>
          </div>
        </div>
      </div>
    </section>
  );
}
