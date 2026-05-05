import { NextResponse } from "next/server";
import { requireAdminContext } from "@/server/auth/guards";
import { prisma } from "@/server/db/prisma";

export async function GET() {
  const adminContext = await requireAdminContext();
  if (adminContext instanceof NextResponse) return adminContext;

  const [users, leads] = await Promise.all([
    prisma.user.count(),
    prisma.slyderLead.count(),
  ]);

  return NextResponse.json({ users, leads });
}
