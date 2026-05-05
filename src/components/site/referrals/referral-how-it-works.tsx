const STEPS = [
  {
    number: "1",
    title: "Create your referral link",
    body: "Fill in the form above and we'll generate a unique referral link for you in seconds.",
  },
  {
    number: "2",
    title: "Share it with a future Slyder",
    body: "Send your link via WhatsApp or any channel. When they visit it, they'll be guided to reserve their spot.",
  },
  {
    number: "3",
    title: "They reserve their spot and complete onboarding",
    body: "Your referred Slyder submits an application, gets approved, activates their account, and completes full onboarding.",
  },
  {
    number: "4",
    title: "Once live and rent-paying, your reward starts",
    body: "After their 30-day rent-free period, they begin paying JMD $2,000 weekly rent. Your reward cycle starts.",
  },
  {
    number: "5",
    title: "You receive JMD $1,000 per qualifying rent cycle",
    body: "For each of the first 5 rent cycles paid by your referred Slyder, you earn JMD $1,000 — totalling JMD $5,000.",
  },
];

export function SlyderReferralHowItWorks() {
  return (
    <section className="section-shell py-16">
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow-badge border-sky-100 bg-sky-50 text-sky-700">How it works</p>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">Five steps to JMD $5,000</h2>
        <div className="mt-10 space-y-6">
          {STEPS.map((step) => (
            <div key={step.number} className="flex gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-600 text-sm font-bold text-white">
                {step.number}
              </div>
              <div>
                <p className="font-semibold text-slate-950">{step.title}</p>
                <p className="mt-1 text-sm leading-7 text-slate-500">{step.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-semibold text-amber-900">Important</p>
          <p className="mt-1 text-sm leading-7 text-amber-800">
            Referral rewards are paid only for Slyders who are approved, activated, live, and rent-paying after their free period.
            SLYDE does not pay rewards for incomplete signups or unapproved applications.
          </p>
        </div>
      </div>
    </section>
  );
}
