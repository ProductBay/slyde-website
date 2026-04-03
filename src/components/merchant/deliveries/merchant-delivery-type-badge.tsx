import { cn } from "@/lib/utils";
import type { DeliveryType } from "@/types/backend/onboarding";

const classes: Record<DeliveryType, string> = {
  in_parish: "bg-slate-100 text-slate-700",
  out_of_parish: "bg-sky-100 text-sky-800",
};

export function MerchantDeliveryTypeBadge({ deliveryType }: { deliveryType: DeliveryType }) {
  return (
    <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]", classes[deliveryType])}>
      {deliveryType.replace(/_/g, " ")}
    </span>
  );
}
