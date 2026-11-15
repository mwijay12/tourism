import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tanzania National Parks & Wildlife Atlas | Kibo & Plains",
  description:
    "Explore Serengeti, Ngorongoro Crater, Mount Kilimanjaro, Tarangire, Ruaha, Mahale Mountains, and Zanzibar with interactive WebGL photography and seasonal insights.",
};

export default function ParksLayout({ children }: { children: React.ReactNode }) {
  return children;
}
