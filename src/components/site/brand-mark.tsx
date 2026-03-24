import Link from "next/link";
import { cn } from "@/lib/utils";

export function BrandMark({
  inverted = false,
  showTagline = false,
  compact = false,
}: {
  inverted?: boolean;
  showTagline?: boolean;
  compact?: boolean;
}) {
  return (
    <Link href="/" className="inline-flex min-w-0 items-center gap-2.5">
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-[1.2rem]",
          compact ? "h-10 w-12" : "h-12 w-16",
        )}
      >
        <svg
          viewBox="0 0 116 82"
          className={cn("block", compact ? "h-10 w-12" : "h-12 w-16")}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="slyde-logo-bottom" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6BEA2F" />
              <stop offset="48%" stopColor="#F1E51F" />
              <stop offset="100%" stopColor="#FFC83A" />
            </linearGradient>
            <linearGradient id="slyde-logo-orange" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF7A00" />
              <stop offset="100%" stopColor="#FFAD1F" />
            </linearGradient>
          </defs>
          <polygon points="10,23 57,2 108,16 39,52" fill="#16325F" />
          <polygon points="2,34 44,54 2,72" fill="url(#slyde-logo-orange)" />
          <polygon points="52,34 101,54 78,62 27,42" fill="url(#slyde-logo-orange)" />
          <polygon points="0,80 53,58 100,34 100,59 46,80" fill="url(#slyde-logo-bottom)" />
          <polygon points="0,80 46,80 100,59 109,63 47,82" fill="#16325F" />
        </svg>
      </span>
      <span className="flex min-w-0 flex-col justify-center">
        <span
          className={cn(
            "truncate font-black uppercase leading-none tracking-[0.12em]",
            compact ? "text-[1.8rem]" : "text-[2rem]",
            inverted ? "text-white" : "text-[#16325F]",
          )}
        >
          SLYDE
        </span>
        {showTagline ? (
          <span
            className={cn(
              "font-semibold italic leading-none",
              compact ? "mt-0.5 text-sm" : "mt-1 text-xl",
              inverted ? "text-orange-300" : "text-[#F97316]",
            )}
          >
            Logistics
          </span>
        ) : null}
      </span>
    </Link>
  );
}
