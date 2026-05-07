import { NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";

export const dynamic = "force-dynamic";

function parseSince(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const since = parseSince(url.searchParams.get("since"));

  const where = since
    ? {
        isPublished: true,
        OR: [{ publishedAt: { gt: since } }, { createdAt: { gt: since } }],
      }
    : { isPublished: true };

  const posts = await prisma.slyderLeadPost.findMany({
    where,
    orderBy: [{ publishedAt: "asc" }, { createdAt: "asc" }],
    take: 5,
    select: {
      id: true,
      title: true,
      body: true,
      ctaHref: true,
      publishedAt: true,
      createdAt: true,
    },
  });

  const latest = await prisma.slyderLeadPost.findFirst({
    where: { isPublished: true },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    select: { publishedAt: true, createdAt: true },
  });

  return NextResponse.json({
    ok: true,
    serverNow: new Date().toISOString(),
    latestPostAt: (latest?.publishedAt || latest?.createdAt || null)?.toISOString() ?? null,
    posts: posts.map((post) => ({
      id: post.id,
      title: post.title,
      body: post.body,
      ctaHref: post.ctaHref,
      publishedAt: (post.publishedAt || post.createdAt).toISOString(),
    })),
  });
}
