import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { AppChrome } from "@/components/layout/app-chrome";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata(
  "SLYDE | Delivery infrastructure for modern commerce",
  "SLYDE is a Jamaica-first logistics network for courier operations, merchant fulfillment, and API-ready delivery orchestration.",
);

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <AppChrome>{children}</AppChrome>

        {GA_ID ? (
          <>
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
          </>
        ) : null}
      </body>
    </html>
  );
}
