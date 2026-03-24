import { ArrowRight } from "lucide-react";
import type { CtaLink } from "@/types/site";
import { SectionHeading } from "@/components/site/section-heading";
import { LinkButton } from "@/components/ui/link-button";

export function CTASection({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions: CtaLink[];
}) {
  return (
    <section className="section-shell py-16">
      <div className="dark-panel relative overflow-hidden p-8 sm:p-10">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-sky-400/10 via-transparent to-cyan-300/10" />
        <div className="relative z-10">
          <SectionHeading eyebrow={eyebrow} title={title} description={description} invert />
        </div>
        <div className="relative z-10 mt-8 flex flex-col gap-3 sm:flex-row">
          {actions.map((action) => (
            <LinkButton
              key={action.href}
              href={action.href}
              variant={action.variant === "primary" ? "secondary" : "ghost"}
              icon={<ArrowRight className="h-4 w-4" />}
            >
              {action.label}
            </LinkButton>
          ))}
        </div>
      </div>
    </section>
  );
}
