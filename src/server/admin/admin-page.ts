import { redirect } from "next/navigation";
import { getSessionContext, hasRole } from "@/server/auth/session";
import { readPersistenceStore } from "@/server/persistence";

export async function getAdminPageContext() {
  const session = await getSessionContext();
  if (session && session.user.isEnabled && hasRole(session.user, ["platform_admin", "operations_admin"])) {
    return {
      user: session.user,
      mode: "authenticated" as const,
    };
  }

  const allowLocalFallback = process.env.SLYDE_ADMIN_UI_DEV_FALLBACK !== "false";

  if (allowLocalFallback) {
    const store = await readPersistenceStore();
    const fallback = store.users.find((user) => hasRole(user, ["platform_admin"]));
    if (fallback) {
      return {
        user: fallback,
        mode: "development" as const,
      };
    }
  }

  redirect("/employee/login");
}
