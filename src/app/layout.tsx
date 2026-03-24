import type { Metadata } from "next";
import "./globals.css";
import { AppChrome } from "@/components/layout/app-chrome";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata(
  "SLYDE | Delivery infrastructure for modern commerce",
  "SLYDE is a Jamaica-first logistics network for courier operations, merchant fulfillment, and API-ready delivery orchestration.",
);

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
