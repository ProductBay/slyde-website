import { Banknote, LayoutGrid, Clock, MapPin, Star } from "lucide-react";

const TRUST_ITEMS = [
  { icon: Banknote, label: "Digital payout support" },
  { icon: LayoutGrid, label: "Structured dispatch" },
  { icon: Clock, label: "Flexible independent earning" },
  { icon: Star, label: "Launch priority access" },
  { icon: MapPin, label: "Built for Jamaica" },
];

export function TrustStrip() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5">
      {TRUST_ITEMS.map(({ icon: Icon, label }) => (
        <div key={label} className="flex items-center gap-2 text-sm font-medium text-slate-600">
          <Icon className="h-4 w-4 text-sky-600 shrink-0" />
          {label}
        </div>
      ))}
    </div>
  );
}
