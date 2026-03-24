import { redirect } from "next/navigation";
import { getSessionContext } from "@/server/auth/session";

export async function getEmployeeSessionOrRedirect() {
  const session = await getSessionContext();
  if (
    !session ||
    !session.user.isEnabled ||
    session.user.accountStatus !== "active" ||
    session.user.userType !== "employee" ||
    !session.user.roles.some((role) => role.startsWith("employee_"))
  ) {
    redirect("/employee/login");
  }

  return session;
}
