import { InfoCardGrid } from "@/components/site/info-card-grid";
import { SectionHeading } from "@/components/site/section-heading";

export function LynkBenefitsGrid({
  sectionId,
  title,
  description,
  items,
}: {
  sectionId: string;
  title: string;
  description?: string;
  items: Array<{ id: string; title: string; body: string }>;
}) {
  return (
    <section id={sectionId} className="section-shell py-16">
      <SectionHeading eyebrow="Digital payout support" title={title} description={description} />
      <div className="mt-10">
        <InfoCardGrid
          items={items.map((item) => ({
            title: item.title,
            description: item.body,
          }))}
          columns="four"
        />
      </div>
    </section>
  );
}
