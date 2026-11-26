"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function PublicNavbar({ variant = "solid" }: { variant?: "hero" | "solid" }) {
  const isHero = variant === "hero";
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<"catalog" | "units" | "contact">("catalog");

  const effectiveSection = pathname === "/" ? activeSection : "catalog";

  const handleSectionClick = (
    section: "catalog" | "units" | "contact",
    target?: string
  ) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    setActiveSection(section);
    setMobileMenuOpen(false);
    if (pathname === "/") {
      event.preventDefault();
      if (target) {
        document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  return (
    <header
      className={
        isHero
          ? "relative z-30 w-full bg-gradient-to-b from-[#061836]/85 via-[#061836]/45 to-transparent text-on-primary transition-all"
          : "sticky top-0 z-40 w-full bg-primary/95 backdrop-blur-md text-on-primary border-b border-white/10 shadow-sm transition-all"
      }
    >
      <div
        className={`max-w-7xl mx-auto px-margin-mobile md:px-margin flex items-center justify-between gap-2 ${
          isHero ? "h-16 sm:h-20 border-b border-white/10" : "h-14 sm:h-16"
        }`}
      >
        {/* Brand Logo */}
        <Link href="/" onClick={handleSectionClick("catalog")} className="flex items-center gap-2 sm:gap-space-sm group min-w-0 flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white flex items-center justify-center overflow-hidden shadow-xs transition-transform group-hover:scale-105 duration-200 flex-shrink-0">
            <img src="/logo.png" alt="Roda.Motorku" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm sm:text-base lg:text-headline-sm font-bold tracking-tight leading-none text-on-primary whitespace-nowrap">
              Roda.Motorku
            </span>
            <span className="hidden min-[1120px]:inline font-label-sm text-[10px] text-on-primary/70 font-medium tracking-wide whitespace-nowrap">
              Showroom Motor Bekas Berkualitas
            </span>
          </div>
        </Link>

        {/* Public Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 flex-shrink-0" aria-label="Navigasi utama">
          <Link
            href="/"
            onClick={handleSectionClick("catalog")}
            aria-current={effectiveSection === "catalog" ? "location" : undefined}
            className={`px-3 xl:px-space-md py-space-xs font-label-md text-label-md whitespace-nowrap transition-colors ${
              effectiveSection === "catalog"
                ? "text-white font-semibold"
                : "text-on-primary/80 hover:text-white"
            }`}
          >
            Katalog Motor
          </Link>
          <Link
            href="/#katalog-unit"
            onClick={handleSectionClick("units", "katalog-unit")}
            aria-current={effectiveSection === "units" ? "location" : undefined}
            className={`px-3 xl:px-space-md py-space-xs font-label-md text-label-md whitespace-nowrap transition-colors ${
              effectiveSection === "units"
                ? "text-white font-semibold"
                : "text-on-primary/80 hover:text-white"
            }`}
          >
            Unit Tersedia
          </Link>
          <Link
            href="/#kontak-showroom"
            onClick={handleSectionClick("contact", "kontak-showroom")}
            aria-current={effectiveSection === "contact" ? "location" : undefined}
            className={`px-3 xl:px-space-md py-space-xs font-label-md text-label-md whitespace-nowrap transition-colors ${
              effectiveSection === "contact"
                ? "text-white font-semibold"
                : "text-on-primary/80 hover:text-white"
            }`}
          >
            Lokasi &amp; Kontak
          </Link>
        </nav>

        {/* Right Action: Direct WhatsApp Showroom Consultation & Admin Login */}
        <div className="flex items-center gap-1.5 sm:gap-space-sm flex-shrink-0">
          <a
            href="https://wa.me/6285608981265?text=Halo%20Admin%20Roda.Motorku,%20saya%20ingin%20tanya%20stok%20unit%20motor%20bekas"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-white font-label-sm text-xs sm:text-label-sm font-semibold shadow-xs transition-colors whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[15px] sm:text-[16px]">
              chat
            </span>
            <span>WA Showroom</span>
          </a>

          <Link
            href="/login"
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-white/10 hover:bg-secondary text-on-primary font-label-sm text-xs sm:text-label-sm font-semibold transition-colors border border-white/20 whitespace-nowrap"
            title="Masuk ke Panel Pengelola Showroom"
          >
            <span className="material-symbols-outlined text-[15px] sm:text-[16px]">
              lock
            </span>
            <span>Login Admin</span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="lg:hidden w-9 h-9 rounded-lg bg-white/10 text-on-primary flex items-center justify-center border border-white/20"
            aria-label="Toggle Menu"
          >
            <span className="material-symbols-outlined text-[20px]">
              {mobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          className={
            isHero
              ? "absolute left-0 right-0 top-full z-40 px-margin-mobile pt-2 lg:hidden"
              : "w-full border-t border-white/10 bg-primary/95 backdrop-blur-md lg:hidden"
          }
        >
          <div
            className={
              isHero
                ? "max-w-7xl mx-auto bg-[#071b2b]/95 backdrop-blur-md border border-white/15 rounded-2xl px-margin-mobile py-space-md flex flex-col gap-space-sm shadow-xl shadow-black/40"
                : "max-w-7xl mx-auto px-margin-mobile py-space-md flex flex-col gap-space-sm"
            }
          >
            <Link
              href="/"
              onClick={handleSectionClick("catalog")}
              className={`font-label-md text-label-md py-2 px-3 rounded-lg ${effectiveSection === "catalog" ? "text-white font-semibold" : "text-on-primary/80 hover:text-white"}`}
            >
              Katalog Motor
            </Link>
            <Link
              href="/#katalog-unit"
              onClick={handleSectionClick("units", "katalog-unit")}
              className={`font-label-md text-label-md py-2 px-3 rounded-lg ${effectiveSection === "units" ? "text-white font-semibold" : "text-on-primary/80 hover:text-white"}`}
            >
              Unit Tersedia
            </Link>
            <Link
              href="/#kontak-showroom"
              onClick={handleSectionClick("contact", "kontak-showroom")}
              className={`font-label-md text-label-md py-2 px-3 rounded-lg ${effectiveSection === "contact" ? "text-white font-semibold" : "text-on-primary/80 hover:text-white"}`}
            >
              Kontak &amp; Lokasi Showroom
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="font-label-md text-label-md text-on-primary font-semibold py-2 px-3 rounded-lg bg-white/10 flex items-center justify-between mt-1"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">lock</span>
                <span>Login Admin Showroom</span>
              </div>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
