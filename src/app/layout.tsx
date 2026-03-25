import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { AppChrome } from "@/components/layout/app-chrome";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata(
  "SLYDE | Delivery infrastructure for modern commerce",
  "SLYDE is a Jamaica-first logistics network for courier operations, merchant fulfillment, and API-ready delivery orchestration.",
);

const GA_ID = "G-ZF3BFBMJEQ";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AppChrome>{children}</AppChrome>

        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
      </body>
    </html>
  );
}