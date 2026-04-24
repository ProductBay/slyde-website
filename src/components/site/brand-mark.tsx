import Image from "next/image";
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
    <Link href="/" className="inline-flex min-w-0 items-center gap-2">
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center overflow-hidden",
          compact ? "h-11 w-[9.75rem]" : "h-12 w-[10.5rem]",
        )}
      >
        <Image
          src="/images/slyde-logo.png"
          alt="SLYDE Logistics"
          width={116}
          height={82}
          className={cn(
            "block h-full w-full object-cover object-center",
            inverted ? "brightness-0 invert" : "",
          )}
          sizes={compact ? "156px" : "168px"}
          priority
        />
      </span>
      {showTagline ? (
        <span
          className={cn(
            "hidden text-xs font-semibold uppercase tracking-[0.18em] sm:inline-flex",
            inverted ? "text-slate-100/80" : "text-slate-500",
          )}
        >
          Jamaica-first network
        </span>
      ) : null}
    </Link>
  );
}
