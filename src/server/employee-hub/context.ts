import { redirect } from "next/navigation";
import { employeeDocumentCategories, employeeDocuments, type EmployeeAudience } from "@/content/employee-hub";
import { getSessionContext } from "@/server/auth/session";
import { readPersistenceStore } from "@/server/persistence";

function resolveEmployeeAudiences(): EmployeeAudience[] {
  return ["all_staff", "field_courier"];
}

export async function getEmployeeHubContext() {
  const session = await getSessionContext();
  if (!session || !session.user.isEnabled || session.user.accountStatus !== "active" || !session.user.roles.includes("slyder")) {
    redirect("/slyder/login");
  }

  const store = await readPersistenceStore();
  const profile = store.slyderProfiles.find((entry) => entry.userId === session.user.id);
  const audiences = resolveEmployeeAudiences();

  const documents = employeeDocuments.filter((document) => document.audiences.some((audience) => audiences.includes(audience)));

  const categories = employeeDocumentCategories
    .map((category) => ({
      ...category,
      documents: documents.filter((document) => document.categoryId === category.id),
    }))
    .filter((category) => category.documents.length > 0);

  return {
    user: session.user,
    profile,
    audiences,
    documents,
    categories,
  };
}
