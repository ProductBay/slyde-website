import { coverageCards } from "@/content/site";
import { InfoCardGrid } from "@/components/site/info-card-grid";
import { SectionHeading } from "@/components/site/section-heading";

export function CoverageSection() {
  return (
    <section className="mx-auto max-w-shell px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <SectionHeading
          eyebrow="Coverage"
          title="Jamaica-first operations with a Caribbean scale path"
          description="SLYDE is launching with a practical rollout model: high-density urban coverage first, staged zone expansion second, and repeatable operating standards for future markets."
        />
        <InfoCardGrid items={coverageCards} columns="three" />
      </div>
    </section>
  );
}
