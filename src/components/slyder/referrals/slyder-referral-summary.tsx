type Stats = {
  totalReferrals: number;
  liveReferrals: number;
  totalEarned: number;
  totalPaid: number;
  remainingPotential: number;
};

export function SlyderReferralSummary({ stats }: { stats: Stats }) {
  const cards = [
    { label: "Total Referrals",    value: String(stats.totalReferrals),                   sub: "all time" },
    { label: "Live Slyders",       value: String(stats.liveReferrals),                    sub: "currently active" },
    { label: "Total Earned",       value: `JMD $${stats.totalEarned.toLocaleString()}`,   sub: "reward cycles triggered" },
    { label: "Total Paid",         value: `JMD $${stats.totalPaid.toLocaleString()}`,     sub: "received so far" },
    { label: "Remaining",          value: `JMD $${stats.remainingPotential.toLocaleString()}`, sub: "outstanding to pay" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((c) => (
        <div key={c.label} className="surface-panel p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{c.label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{c.value}</p>
          <p className="mt-0.5 text-xs text-slate-400">{c.sub}</p>
        </div>
      ))}
    </div>
  );
}
