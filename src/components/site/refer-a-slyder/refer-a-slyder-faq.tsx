const faqs = [
  {
    question: "When is the reward actually earned?",
    answer: "Only after the referred Slyder is approved, activates, completes onboarding and readiness, and finishes a first live delivery.",
  },
  {
    question: "What is the launch reward?",
    answer: "The launch reward is a fixed JMD 400 SLYDE credit with a JMD 2000 minimum order value for redemption.",
  },
  {
    question: "Can I gift the reward?",
    answer: "Yes. If you are not in a SLYDE-ready customer zone, the reward can be gifted one time only to a friend or family member with a valid SLYDE customer account in an active zone.",
  },
  {
    question: "Do I earn cash?",
    answer: "No. This is a non-cash SLYDE ecosystem reward, not a payout or commission system.",
  },
];

export function ReferASlyderFaq() {
  return (
    <section className="section-shell py-16">
      <div className="surface-panel p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">Referral FAQ</p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">Answers before you submit</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {faqs.map((faq) => (
            <div key={faq.question} className="rounded-3xl border border-slate-200 bg-surface-1 p-5">
              <h3 className="text-lg font-semibold text-slate-950">{faq.question}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
