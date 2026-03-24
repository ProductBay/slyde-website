import { notFound } from "next/navigation";
import { HandbookView } from "@/components/employee/handbook-view";
import { getEmployeePortalData } from "@/modules/employee/services/employee-portal.service";
import { getEmployeeHandbook } from "@/server/employee-hub/handbook";
import { getEmployeeSessionOrRedirect } from "@/server/employee/context";

function renderSimpleMarkdown(content: string) {
  return content
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export default async function EmployeeGuideDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getEmployeeSessionOrRedirect();
  const portal = await getEmployeePortalData(session.user.id);

  if (slug === "employee-handbook") {
    const handbook = await getEmployeeHandbook();
    return <HandbookView handbook={handbook} />;
  }

  const guide = portal.guides.find((item) => item.slug === slug);
  if (!guide) notFound();

  const blocks = renderSimpleMarkdown(guide.contentMarkdown);

  return (
    <article className="employee-paper p-6 sm:p-8 lg:p-10">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{guide.category}</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{guide.title}</h1>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">{guide.summary}</p>
      <div className="mt-8 space-y-4 text-[15px] leading-7 text-slate-700">
        {blocks.map((block) => (
          <p key={block}>{block}</p>
        ))}
      </div>
    </article>
  );
}
