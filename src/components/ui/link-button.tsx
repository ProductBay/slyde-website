import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";

export function LinkButton({
  href,
  children,
  variant = "primary",
  className,
  icon,
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
  icon?: ReactNode;
}) {
  const variants: Record<Variant, string> = {
    primary: "bg-primary text-primary-foreground shadow-glow hover:-translate-y-0.5 hover:bg-slate-800",
    secondary: "bg-white/96 text-slate-900 ring-1 ring-slate-200/90 shadow-soft hover:-translate-y-0.5 hover:bg-white",
    ghost: "bg-transparent text-slate-100 ring-1 ring-white/18 hover:-translate-y-0.5 hover:bg-white/10",
  };

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold transition duration-200",
        variants[variant],
        className,
      )}
    >
      {children}
      {icon}
    </Link>
  );
}
