import { PublicSupportIntake } from "@/components/support/public-support-intake";
import { HelpArticlesList } from "@/components/support/help-articles-list";
import { listPublishedSupportKnowledgeArticles } from "@/modules/support/services/support-knowledge.service";

export default async function SupportPage() {
  const articles = await listPublishedSupportKnowledgeArticles();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
      <section className="surface-panel p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-700">Support</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">SLYDE help and support</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          Reach SLYDE support, create a support record, and review published help content from one place.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <PublicSupportIntake />
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-xl font-semibold text-slate-950">Published help articles</h2>
          <HelpArticlesList articles={articles} />
        </section>
      </div>
    </div>
  );
}
