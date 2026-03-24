import type { Metadata } from "next";

const siteName = "SLYDE";
const baseUrl = "https://slyde.app";

export function buildMetadata(
  title: string,
  description: string,
  path = "/",
): Metadata {
  const url = new URL(path, baseUrl).toString();

  return {
    title,
    description,
    metadataBase: new URL(baseUrl),
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
