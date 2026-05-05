export function SlyderReferralHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-sky-950 via-sky-900 to-slate-900 px-4 py-20 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <p className="eyebrow-badge border-sky-500/30 bg-sky-500/10 text-sky-300">Referral Programme</p>
        <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Earn JMD $5,000 for every Slyder you help activate
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-sky-100">
          Refer someone with a bike, car, van, or reliable transport to join SLYDE. When they go live and begin their qualifying rent cycles, you earn JMD $5,000 over five weekly payouts.
        </p>
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <a
            href="#referral-form"
            className="rounded-full bg-sky-500 px-8 py-3.5 text-sm font-bold text-white hover:bg-sky-400"
          >
            Create My Referral Link
          </a>
          <p className="text-sm text-sky-300">No account required. Free to refer.</p>
        </div>
      </div>
    </section>
  );
}
