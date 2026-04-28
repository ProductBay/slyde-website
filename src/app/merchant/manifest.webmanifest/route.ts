import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    name: "SLYDE Merchant Portal",
    short_name: "Merchant",
    description: "Merchant login, dispatch, orders, addresses, delivery tracking, and support.",
    start_url: "/merchant/login",
    scope: "/merchant/",
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
