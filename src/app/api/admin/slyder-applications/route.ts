import { NextResponse } from "next/server";
import { requireAdminContext } from "@/server/auth/guards";
import { applicationListQuerySchema } from "@/modules/onboarding/schemas/onboarding.schemas";
import { listSlyderApplications } from "@/modules/onboarding/services/onboarding.service";

export async function GET(request: Request) {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  const url = new URL(request.url);
  const parsed = applicationListQuerySchema.safeParse({
    status: url.searchParams.get("status") ?? undefined,
    search: url.searchParams.get("search") ?? undefined,
    sortBy: url.searchParams.get("sortBy") ?? undefined,
    sortDirection: url.searchParams.get("sortDirection") ?? undefined,
    page: url.searchParams.get("page") ?? undefined,
    pageSize: url.searchParams.get("pageSize") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const result = await listSlyderApplications(parsed.data);
  return NextResponse.json(result);
}
