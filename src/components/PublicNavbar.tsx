"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function PublicNavbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<"catalog" | "units" | "contact">("catalog");
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const navItems = useRef<Record<"catalog" | "units" | "contact", HTMLAnchorElement | null>>({
    catalog: null,
    units: null,
    contact: null,
  });

  useEffect(() => {
    if (pathname !== "/") setActiveSection("catalog");
  }, [pathname]);

  useEffect(() => {
    const updateIndicator = () => {
      const activeItem = navItems.current[activeSection];
      if (activeItem) {
        setIndicator({ left: activeItem.offsetLeft, width: activeItem.offsetWidth });
      }
    };
    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [activeSection, pathname]);

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
    <header className="fixed top-0 left-0 right-0 z-40 px-margin-mobile md:px-margin pt-3 sm:pt-4 pointer-events-none transition-all">
      <div className="max-w-7xl mx-auto h-16 px-4 md:px-6 flex items-center justify-between pointer-events-auto bg-primary/90 backdrop-blur-md text-on-primary rounded-2xl shadow-xl shadow-black/25 border border-white/15">
        {/* Brand Logo */}
        <Link href="/" onClick={handleSectionClick("catalog")} className="flex items-center gap-space-sm group">
          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center overflow-hidden shadow-xs transition-transform group-hover:scale-105 duration-200">
            <img src="/logo.png" alt="Roda.Motorku" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm font-bold tracking-tight leading-none text-on-primary">
              Roda.Motorku
            </span>
            <span className="font-label-sm text-[10px] text-on-primary/70 font-medium tracking-wide">
              Showroom Motor Bekas Berkualitas
            </span>
          </div>
        </Link>

        {/* Public Navigation Links */}
        <nav className="relative hidden md:flex items-center" aria-label="Navigasi utama">
          <span
            aria-hidden="true"
            className="absolute top-0 bottom-0 rounded-lg bg-secondary transition-all duration-300 ease-out"
            style={{ left: indicator.left, width: indicator.width }}
          />
          <Link
            href="/"
            ref={(node) => { navItems.current.catalog = node; }}
            onClick={handleSectionClick("catalog")}
            aria-current={activeSection === "catalog" ? "location" : undefined}
            className="relative z-10 rounded-lg font-label-md text-label-md px-space-md py-space-xs text-on-primary transition-colors"
          >
            Katalog Motor
          </Link>
          <a
            href="/#katalog-unit"
            ref={(node) => { navItems.current.units = node; }}
            onClick={handleSectionClick("units", "katalog-unit")}
            aria-current={activeSection === "units" ? "location" : undefined}
            className="relative z-10 rounded-lg font-label-md text-label-md text-on-primary px-space-md py-space-xs transition-colors"
          >
            Unit Tersedia
          </a>
          <a
            href="/#kontak-showroom"
            ref={(node) => { navItems.current.contact = node; }}
            onClick={handleSectionClick("contact", "kontak-showroom")}
            aria-current={activeSection === "contact" ? "location" : undefined}
            className="relative z-10 rounded-lg font-label-md text-label-md text-on-primary px-space-md py-space-xs transition-colors"
          >
            Lokasi &amp; Kontak
          </a>
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
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-secondary text-on-primary font-label-sm text-label-sm font-semibold transition-colors border border-white/20"
            title="Masuk ke Panel Pengelola Showroom"
          >
            <span className="material-symbols-outlined text-[16px]">
              lock
            </span>
            <span>Login Admin</span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden w-9 h-9 rounded-lg bg-white/10 text-on-primary flex items-center justify-center border border-white/20"
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
        <div className="max-w-7xl mx-auto mt-2 pointer-events-auto md:hidden bg-primary/95 backdrop-blur-md border border-white/15 rounded-2xl px-margin-mobile py-space-md flex flex-col gap-space-sm shadow-xl shadow-black/30">
          <Link
            href="/"
            onClick={handleSectionClick("catalog")}
            className={`font-label-md text-label-md py-2 px-3 rounded-lg ${activeSection === "catalog" ? "bg-secondary text-on-secondary" : "text-on-primary/80"}`}
          >
            Katalog Motor
          </Link>
          <a
            href="/#katalog-unit"
            onClick={handleSectionClick("units", "katalog-unit")}
            className={`font-label-md text-label-md py-2 px-3 rounded-lg ${activeSection === "units" ? "bg-secondary text-on-secondary" : "text-on-primary/80"}`}
          >
            Unit Tersedia
          </a>
          <a
            href="/#kontak-showroom"
            onClick={handleSectionClick("contact", "kontak-showroom")}
            className={`font-label-md text-label-md py-2 px-3 rounded-lg ${activeSection === "contact" ? "bg-secondary text-on-secondary" : "text-on-primary/80"}`}
          >
            Kontak &amp; Lokasi Showroom
          </a>
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
      )}
    </header>
  );
}
