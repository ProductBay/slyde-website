import { HeroSection } from "@/components/site/hero-section";

export function SlyderPayoutsHero({
  eyebrow,
  title,
  description,
  primaryCta,
  secondaryCta,
}: {
  eyebrow: string;
  title: string;
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
}) {
  return (
    <HeroSection
      eyebrow={eyebrow}
      title={title}
      description={description}
      actions={[
        { href: primaryCta.href, label: primaryCta.label },
        ...(secondaryCta ? [{ href: secondaryCta.href, label: secondaryCta.label, variant: "secondary" as const }] : []),
      ]}
    />
  );
}
