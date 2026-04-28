import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    name: "SLYDE Admin Console",
    short_name: "Admin",
    description: "SLYDE operations, applications, notifications, readiness, and platform controls.",
    start_url: "/admin/login",
    scope: "/admin/",
    display: "standalone",
    background_color: "#f4f8fb",
    theme_color: "#081223",
    icons: [
      {
        src: "/images/slyde-favicon.png",
        sizes: "1024x1024",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  });
}
