import type { Metadata, Viewport } from "next";
import { MerchantLoginForm } from "@/components/merchant/merchant-login-form";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = {
  ...buildMetadata(
    "Merchant Login",
    "Sign in to the SLYDE merchant portal for dispatch, orders, tracking, addresses, and support.",
    "/merchant/login",
  ),
  manifest: "/merchant/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "SLYDE Merchant",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#081223",
};

export default function MerchantLoginPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(125,211,252,0.18),_transparent_38%),linear-gradient(180deg,_#f8fafc_0%,_#e2e8f0_100%)] px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <MerchantLoginForm />
      </div>
    </div>
  );
}
