import { FAQAccordion } from "@/components/site/faq-accordion";

export function PaymentFaqGroup({
  sectionId,
  title,
  items,
}: {
  sectionId: string;
  title: string;
  items: Array<{ id: string; question: string; answer: string }>;
}) {
  return (
    <section id={sectionId} className="section-shell py-16">
      <FAQAccordion
        categories={[
          {
            title,
            items: items.map((item) => ({
              question: item.question,
              answer: item.answer,
            })),
          },
        ]}
      />
    </section>
  );
}
