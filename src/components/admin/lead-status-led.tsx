import { cn } from "@/lib/utils";

export type LEDStatusType = "qualified" | "invited" | "started" | "approved" | "rejected" | "new" | "nurturing";

const LED_CONFIG: Record<LEDStatusType, { color: string; glow: string; tooltip: string }> = {
  qualified: {
    color: "bg-emerald-500",
    glow: "shadow-lg shadow-emerald-500/50",
    tooltip: "Qualified",
  },
  invited: {
    color: "bg-amber-500",
    glow: "shadow-lg shadow-amber-500/50",
    tooltip: "Invited to Next Stage",
  },
  started: {
    color: "bg-blue-500",
    glow: "shadow-lg shadow-blue-500/50",
    tooltip: "Application Started",
  },
  approved: {
    color: "bg-green-500",
    glow: "shadow-lg shadow-green-500/50",
    tooltip: "Approved",
  },
  rejected: {
    color: "bg-red-500",
    glow: "shadow-lg shadow-red-500/50",
    tooltip: "Rejected",
  },
  new: {
    color: "bg-sky-500",
    glow: "shadow-lg shadow-sky-500/50",
    tooltip: "New Lead",
  },
  nurturing: {
    color: "bg-amber-400",
    glow: "shadow-lg shadow-amber-400/50",
    tooltip: "Nurturing",
  },
};

export function getStatusLED(status: string, applicationInviteUnlocked: boolean): LEDStatusType {
  switch (status) {
    case "APPROVED":
      return "approved";
    case "REJECTED":
      return "rejected";
    case "STARTED_APPLICATION":
      return "started";
    case "SUBMITTED":
    case "UNDER_REVIEW":
      return "started";
    case "ACTIVATED":
    case "LIVE":
      return "approved";
    case "QUALIFIED":
      return applicationInviteUnlocked ? "invited" : "qualified";
    case "NURTURING":
      return "nurturing";
    case "NEW":
      return "new";
    case "ABANDONED":
      return "rejected";
    default:
      return "new";
  }
}

export function LeadStatusLED({
  status,
  applicationInviteUnlocked,
  className,
}: {
  status: string;
  applicationInviteUnlocked: boolean;
  className?: string;
}) {
  const ledType = getStatusLED(status, applicationInviteUnlocked);
  const config = LED_CONFIG[ledType];

  return (
    <div
      className={cn("group relative", className)}
      title={config.tooltip}
      aria-label={config.tooltip}
    >
      {/* LED indicator with pulse and glow */}
      <div
        className={cn(
          "h-4 w-4 rounded-full",
          config.color,
          config.glow,
          "animate-pulse transition-all",
          "hover:animate-none"
        )}
      />
      {/* Tooltip on hover */}
      <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
        {config.tooltip}
      </div>
    </div>
  );
}
