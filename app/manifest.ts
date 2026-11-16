import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kibo & Plains — Tanzania Expeditions",
    short_name: "Kibo & Plains",
    description:
      "Arusha & Moshi luxury Tanzania expedition operator: Mount Kilimanjaro climbs, Serengeti Great Migration safaris, Ngorongoro Crater, and Zanzibar retreats.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#08100c",
    theme_color: "#08100c",
    categories: ["travel", "lifestyle", "navigation"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
    shortcuts: [
      {
        name: "Mount Kilimanjaro",
        short_name: "Kilimanjaro",
        description: "Explore 5,895 m summit routes & elevation charts",
        url: "/kilimanjaro",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Parks & Wildlife Atlas",
        short_name: "Parks",
        description: "Browse Serengeti, Ngorongoro, Tarangire & Zanzibar",
        url: "/parks",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Plan Expedition",
        short_name: "Inquire",
        description: "Configure your custom Tanzania itinerary",
        url: "/inquire",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
