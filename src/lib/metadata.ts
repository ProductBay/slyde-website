import type { Metadata } from "next";

import { getAppBaseUrl } from "@/lib/app-base-url";

const siteName = "SLYDE";

export function buildMetadata(
  title: string,
  description: string,
  path = "/",
): Metadata {
  const baseUrl = getAppBaseUrl();
  const url = new URL(path, baseUrl).toString();

  return {
    title,
    description,
    metadataBase: new URL(baseUrl),
    icons: {
      icon: "/icon.svg",
      shortcut: "/icon.svg",
      apple: "/icon.svg",
    },
    openGraph: {
      title,
      description,
      url,
      siteName,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: url,
    },
  };
}
