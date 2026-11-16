import type { Metadata, Viewport } from "next";
import "./globals.css";
import { TransitionProvider } from "@/components/creative/transition-provider";
import { AppChrome } from "@/components/site/app-chrome";

export const metadata: Metadata = {
  title: "Kibo & Plains | Luxury Mount Kilimanjaro Climbs & Tanzania Safaris",
  description:
    "Arusha & Moshi-based luxury Tanzania expedition agency. Climb Mount Kilimanjaro via Lemosho or Northern Circuit, witness the Serengeti Great Migration, Ngorongoro Crater, Tarangire, Ruaha, Mahale, and Zanzibar.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Kibo & Plains",
  },
  applicationName: "Kibo & Plains",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#145131" },
    { media: "(prefers-color-scheme: dark)", color: "#08100c" },
  ],
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased">
        <TransitionProvider>
          <AppChrome>{children}</AppChrome>
        </TransitionProvider>
      </body>
    </html>
  );
}
