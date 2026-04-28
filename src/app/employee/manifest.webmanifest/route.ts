import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    name: "SLYDE Employee Portal",
    short_name: "Employee",
    description: "SLYDE employee login, onboarding, guides, announcements, pay, and profile access.",
    start_url: "/employee/login",
    scope: "/employee/",
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
