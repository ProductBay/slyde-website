import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionContext, hasRole } from "@/server/auth/session";

const AVATAR_COOKIE = "slyde_user_avatar";

export async function GET() {
  const session = await getSessionContext();

  if (!session?.user?.isEnabled) {
    return NextResponse.json(
      { authenticated: false },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  const cookieStore = await cookies();
  const avatarUrl = cookieStore.get(AVATAR_COOKIE)?.value;
  const accountPath = hasRole(session.user, ["platform_admin", "operations_admin"]) ? "/admin" : "/account";

  return NextResponse.json(
    {
      authenticated: true,
      accountPath,
      user: {
        fullName: session.user.fullName,
        email: session.user.email,
      },
      avatarUrl,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
