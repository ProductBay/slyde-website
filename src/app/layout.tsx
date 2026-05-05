import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { AppChrome } from "@/components/layout/app-chrome";
import { SplashGate } from "@/components/site/splash-gate";
import { WebAppInstallPrompt } from "@/components/site/web-app-install-prompt";
import { buildMetadata } from "@/lib/metadata";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = buildMetadata(
  "SLYDE | Delivery infrastructure for modern commerce",
  "SLYDE is Jamaica's modern logistics network for courier onboarding, merchant delivery support, live tracking, and scalable fulfillment infrastructure.",
);

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <SplashGate />
        <AppChrome>{children}</AppChrome>
        <WebAppInstallPrompt />
        <Analytics />
        <Script
          src="https://cdn.jotfor.ms/agent/embedjs/019864c4e3e37599aeab74f4e01a4d6f51ba/embed.js"
          strategy="afterInteractive"
        />
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
