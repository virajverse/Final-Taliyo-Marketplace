import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Taliyo Marketplace",
    short_name: "Taliyo",
    description: "Services marketplace PWA.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2563eb",
    icons: [
      {
        src: "https://placehold.co/192x192/png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "https://placehold.co/512x512/png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
