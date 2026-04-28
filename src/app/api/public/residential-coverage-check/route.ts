import { NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parish = searchParams.get("parish")?.trim();

    if (!parish) {
      return NextResponse.json({ covered: false, message: "Parish is required" }, { status: 400 });
    }

    const zone = await prisma.coverageZone.findFirst({
      where: {
        parish: { equals: parish, mode: "insensitive" },
        OR: [{ isLive: true }, { isPaused: false }],
      },
      select: { id: true, name: true, parish: true, isLive: true, isPaused: true, estimatedLaunchLabel: true },
    });

    if (!zone) {
      return NextResponse.json({
        covered: false,
        parish,
        message: "This parish is not yet in our coverage area. We are expanding — check back soon.",
      });
    }

    if (zone.isLive && !zone.isPaused) {
      return NextResponse.json({
        covered: true,
        status: "live",
        parish,
        zoneName: zone.name,
        message: "Great news — we cover your area and can dispatch from your home.",
      });
    }

    return NextResponse.json({
      covered: false,
      status: "building",
      parish,
      zoneName: zone.name,
      estimatedLaunchLabel: zone.estimatedLaunchLabel,
      message: `Your area (${zone.name}) is in our build plan. Submit your details and we will notify you when we go live.`,
    });
  } catch (err) {
    console.error("[residential-coverage-check] GET error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
