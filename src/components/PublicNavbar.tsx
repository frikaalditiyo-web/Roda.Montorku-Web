"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function PublicNavbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-50 bg-primary-container shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
      <div className="h-16 max-w-7xl mx-auto px-margin-mobile md:px-margin flex items-center justify-between">
        <Link className="flex items-center gap-space-xs" href="/">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-on-primary text-[20px]">
              two_wheeler
            </span>
          </div>
          <span className="font-headline-sm text-headline-sm text-on-primary tracking-tight font-bold">
            RODA.MOTORKU
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-space-lg">
          <Link
            href="/"
            className={
              pathname === "/"
                ? "transition-colors bg-primary text-on-primary rounded font-label-md text-label-md px-space-md py-space-xs"
                : "font-label-md text-label-md text-on-primary-container hover:text-on-primary transition-colors px-space-sm py-space-xs"
            }
          >
            Katalog Motor
          </Link>
          <a
            href="#katalog-unit"
            className="font-label-md text-label-md text-on-primary-container hover:text-on-primary transition-colors px-space-sm py-space-xs"
          >
            Unit Tersedia
          </a>
          <a
            href="#kontak-showroom"
            className="font-label-md text-label-md text-on-primary-container hover:text-on-primary transition-colors px-space-sm py-space-xs"
          >
            Lokasi & Kontak
          </a>
        </nav>

        <div className="flex items-center gap-space-sm">
          <Link
            href="/admin/dashboard"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/70 hover:bg-primary text-on-primary font-label-sm text-label-sm transition-colors"
            title="Buka Konsol Admin"
          >
            <span className="material-symbols-outlined text-[16px]">
              admin_panel_settings
            </span>
            <span>Panel Admin</span>
          </Link>
          <Link
            href="/login"
            title="Login Admin Showroom"
            className="w-9 h-9 rounded-full bg-primary hover:bg-primary/80 flex items-center justify-center transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-on-primary text-[18px]">
              person
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden w-9 h-9 rounded-lg bg-primary text-on-primary flex items-center justify-center"
            aria-label="Toggle Menu"
          >
            <span className="material-symbols-outlined text-[20px]">
              {mobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-primary border-t border-primary-container px-margin-mobile py-space-md flex flex-col gap-space-sm">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="font-label-md text-label-md text-on-primary py-2 px-3 rounded bg-primary-container"
          >
            Katalog Motor
          </Link>
          <a
            href="#kontak-showroom"
            onClick={() => setMobileMenuOpen(false)}
            className="font-label-md text-label-md text-on-primary-container hover:text-on-primary py-2 px-3"
          >
            Kontak & Lokasi Showroom
          </a>
          <Link
            href="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="font-label-md text-label-md text-primary-fixed py-2 px-3 flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">
              login
            </span>
            <span>Login Admin Showroom</span>
          </Link>
        </div>
      )}
    </header>
  );
}
