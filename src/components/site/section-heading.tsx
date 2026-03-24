import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  invert = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  invert?: boolean;
}) {
  return (
    <div className={cn("space-y-4", align === "center" && "mx-auto max-w-3xl text-center")}>
      {eyebrow ? (
        <p
          className={cn(
            "eyebrow-badge",
            invert ? "border-white/15 bg-white/8 text-sky-200" : "border-sky-100 bg-sky-50 text-sky-700",
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2 className={cn("max-w-4xl text-3xl font-semibold tracking-[-0.04em] sm:text-4xl lg:text-[2.8rem]", invert ? "text-white" : "text-slate-950")}>
        {title}
      </h2>
      {description ? (
        <p className={cn("max-w-3xl text-base leading-7 sm:text-lg sm:leading-8", invert ? "text-slate-300" : "text-slate-600")}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
