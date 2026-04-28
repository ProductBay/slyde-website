import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SLYDE",
    short_name: "SLYDE",
    description: "SLYDE delivery infrastructure, applications, portals, and support.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f4f8fb",
    theme_color: "#081223",
    icons: [
      {
        src: "/images/slyde-favicon.png",
        sizes: "1024x1024",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
