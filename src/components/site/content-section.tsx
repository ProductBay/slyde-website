import type { ReactNode } from "react";
import { SectionHeading } from "@/components/site/section-heading";

export function ContentSection({
  sectionId,
  eyebrow,
  title,
  description,
  children,
}: {
  sectionId?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section id={sectionId} className="section-shell py-16">
      <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
        <SectionHeading eyebrow={eyebrow} title={title} description={description} />
        <div className="surface-panel p-8">{children}</div>
      </div>
    </section>
  );
}
