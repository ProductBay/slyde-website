import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    name: "SLYDE Slyder Portal",
    short_name: "Slyder",
    description: "Slyder login, onboarding, setup, readiness, and delivery account access.",
    start_url: "/slyder/login",
    scope: "/slyder/",
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
