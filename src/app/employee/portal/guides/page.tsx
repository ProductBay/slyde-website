import { GuideSearchPanel } from "@/components/employee/guide-search-panel";
import { getEmployeePortalData } from "@/modules/employee/services/employee-portal.service";
import { getEmployeeHandbook } from "@/server/employee-hub/handbook";
import { getEmployeeSessionOrRedirect } from "@/server/employee/context";

export default async function EmployeeGuidesPage() {
  const session = await getEmployeeSessionOrRedirect();
  const portal = await getEmployeePortalData(session.user.id);
  const handbook = await getEmployeeHandbook();

  const guides = [
    {
      slug: "employee-handbook",
      title: "SLYDE employee handbook",
      summary: "The primary internal handbook presented in a dedicated digital reading layout.",
      category: "featured handbook",
      href: "/employee/portal/guides/employee-handbook",
      searchTerms: handbook.sections.map((section) => section.title),
    },
    ...portal.guides
      .filter((guide) => guide.slug !== "employee-handbook")
      .map((guide) => ({
        slug: guide.slug,
        title: guide.title,
        summary: guide.summary,
        category: guide.category,
        href: `/employee/portal/guides/${guide.slug}`,
        searchTerms: [guide.category, guide.summary, guide.title],
      })),
  ];

  return <GuideSearchPanel guides={guides} />;
}
