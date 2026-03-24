export function EligibilityStatusBanner({
  eligibilityState,
  zoneName,
}: {
  eligibilityState: "eligible_online" | "eligible_offline" | "setup_incomplete" | "blocked";
  zoneName?: string;
}) {
  const config =
    eligibilityState === "eligible_online"
      ? {
          tone: "border-emerald-200 bg-emerald-50 text-emerald-800",
          title: "You're ready to go online",
          body: `${zoneName || "Your zone"} is live and your account meets the current onboarding and readiness requirements.`,
        }
      : eligibilityState === "eligible_offline"
        ? {
            tone: "border-sky-200 bg-sky-50 text-sky-800",
            title: "Waiting for your area to go live",
            body: `Your onboarding is complete. ${zoneName || "Your zone"} is not live yet, so SLYDE will notify you when deliveries open.`,
          }
        : eligibilityState === "blocked"
          ? {
              tone: "border-rose-200 bg-rose-50 text-rose-800",
              title: "Your account is blocked from operations",
              body: "A required account, legal, or readiness condition is preventing operational access right now.",
            }
          : {
              tone: "border-amber-200 bg-amber-50 text-amber-800",
              title: "More onboarding is required",
              body: "Complete the remaining activation, setup, and readiness items before SLYDE can evaluate you as operationally ready.",
            };

  return (
    <div className={`rounded-[1.75rem] border p-5 ${config.tone}`}>
      <p className="text-sm font-semibold">{config.title}</p>
      <p className="mt-2 text-sm leading-7">{config.body}</p>
    </div>
  );
}
