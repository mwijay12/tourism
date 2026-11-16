import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Expedition Portal | Kibo & Plains",
  description:
    "Sign in with Google to view your Tanzania itinerary milestones, KPAP crew allocation, travel notes, and PDF invoices.",
  robots: { index: false, follow: false },
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
