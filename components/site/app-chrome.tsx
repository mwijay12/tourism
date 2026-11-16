"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { SiteNavbar } from "@/components/site/site-navbar";
import { SiteFooter } from "@/components/site/site-footer";
import { PwaRegister } from "@/components/site/pwa-register";

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const isAppWorkspace =
    pathname.startsWith("/admin") || pathname.startsWith("/portal");

  if (isAppWorkspace) {
    return (
      <>
        <main className="flex-1 min-h-screen">{children}</main>
        <PwaRegister />
      </>
    );
  }

  return (
    <>
      <SiteNavbar />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <PwaRegister />
    </>
  );
}
