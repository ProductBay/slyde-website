// Configurable founding Slyder spot counter
// Update SPOTS_RESERVED to reflect actual reservations or connect to an API in future.
const SPOTS_RESERVED = 243;
const SPOTS_TOTAL = 500;

export function FoundingSlyderCounter() {
  const pct = Math.round((SPOTS_RESERVED / SPOTS_TOTAL) * 100);

  return (
    <div className="surface-card p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-700">
        Founding Spots
      </p>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-semibold tabular-nums text-slate-950">
          {SPOTS_RESERVED}
        </span>
        <span className="text-sm text-slate-500">/ {SPOTS_TOTAL} reserved</span>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Founding Slyder spots are limited per launch zone. Reserve yours before your area fills up.
      </p>
    </div>
  );
}
