"use client";

import React from "react";
import RidgelineDitherFooter from "@/components/ui/ridgeline-dither-footer";

export function SiteFooter() {
  return (
    <RidgelineDitherFooter
      preset="auto"
      seed={19}
      ridges={6}
      pixel={3}
      mist={0.78}
      drift={1}
      altimeter={true}
      name="Kibo & Plains"
      brandHref="/"
      tagline="Bespoke Mount Kilimanjaro expeditions, private Northern & Southern Circuit safaris, and Zanzibar island escapes crafted in Arusha, Tanzania · Digital system engineered by Altraware Technology."
      columns={[
        {
          title: "Expeditions",
          links: [
            { label: "Mount Kilimanjaro", href: "/kilimanjaro", badge: "5,895m" },
            { label: "Serengeti Migration", href: "/parks?park=serengeti" },
            { label: "Ngorongoro Crater", href: "/parks?park=ngorongoro" },
            { label: "Tarangire & Ruaha", href: "/parks?park=tarangire" },
            { label: "Mahale & Zanzibar", href: "/parks?park=zanzibar" },
          ],
        },
        {
          title: "Planning & Ethics",
          links: [
            { label: "Plan Custom Safari", href: "/inquire", badge: "2026–27" },
            { label: "KPAP Porter Charter", href: "/kilimanjaro#kpap" },
            { label: "Migration Calendar", href: "/#seasons" },
            { label: "WhatsApp Concierge", href: "https://wa.me/255792867427" },
          ],
        },
        {
          title: "Legal & Studio",
          links: [
            { label: "Terms & Conditions", href: "/terms" },
            { label: "Privacy & PDPA 2022", href: "/privacy" },
            { label: "Altraware Technology", href: "https://altraware-tech.vercel.app/" },
            { label: "Altra Motion Lab", href: "https://altra-motion-lab.vercel.app/services/" },
          ],
        },
      ]}
      socials={[
        { icon: "instagram", href: "https://instagram.com", label: "Kibo & Plains on Instagram" },
        { icon: "youtube", href: "https://youtube.com", label: "Kibo & Plains Expedition Films" },
        { icon: "linkedin", href: "https://linkedin.com", label: "Kibo & Plains on LinkedIn" },
        { icon: "github", href: "https://github.com/mwijay12/tourism", label: "Project Source on GitHub" },
      ]}
      copyright={`© ${new Date().getFullYear()} Kibo & Plains Expeditions Ltd · Arusha & Moshi, Tanzania.`}
      credit={{ label: "Altraware Technology", href: "https://altraware-tech.vercel.app/" }}
    />
  );
}
