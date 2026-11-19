"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function PublicNavbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-primary text-on-primary shadow-md">
      <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-space-sm group">
          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center overflow-hidden shadow-xs transition-transform group-hover:scale-105 duration-200">
            <img src="/logo.png" alt="RODA.MOTORKU" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm font-bold tracking-tight text-on-primary leading-none">
              RODA<span className="text-secondary">.MOTORKU</span>
            </span>
            <span className="font-label-sm text-[10px] text-on-primary/70 font-medium tracking-wide">
              Showroom Motor Bekas Berkualitas
            </span>
          </div>
        </Link>

        {/* Public Navigation Links */}
        <nav className="hidden md:flex items-center gap-space-md">
          <Link
            href="/"
            className={
              pathname === "/"
                ? "transition-colors bg-secondary text-on-secondary rounded-lg font-label-md text-label-md px-space-md py-space-xs"
                : "font-label-md text-label-md text-on-primary/80 hover:text-on-primary transition-colors px-space-sm py-space-xs"
            }
          >
            Katalog Motor
          </Link>
          <a
            href="/#katalog-unit"
            className="font-label-md text-label-md text-on-primary/80 hover:text-on-primary transition-colors px-space-sm py-space-xs"
          >
            Unit Tersedia
          </a>
          <a
            href="/#kontak-showroom"
            className="font-label-md text-label-md text-on-primary/80 hover:text-on-primary transition-colors px-space-sm py-space-xs"
          >
            Lokasi &amp; Kontak
          </a>
        </nav>

        {/* Right Action: Direct WhatsApp Showroom Consultation & Admin Login */}
        <div className="flex items-center gap-space-sm">
          <a
            href="https://wa.me/6285608981265?text=Halo%20Admin%20RODA.MOTORKU,%20saya%20ingin%20tanya%20stok%20unit%20motor%20bekas"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-white font-label-sm text-label-sm font-semibold shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">
              chat
            </span>
            <span>Konsultasi WA</span>
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
        <div className="md:hidden bg-primary border-t border-white/10 px-margin-mobile py-space-md flex flex-col gap-space-sm shadow-md">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="font-label-md text-label-md text-on-secondary py-2 px-3 rounded-lg bg-secondary"
          >
            Katalog Motor
          </Link>
          <a
            href="/#katalog-unit"
            onClick={() => setMobileMenuOpen(false)}
            className="font-label-md text-label-md text-on-primary/80 hover:text-on-primary py-2 px-3"
          >
            Unit Tersedia
          </a>
          <a
            href="/#kontak-showroom"
            onClick={() => setMobileMenuOpen(false)}
            className="font-label-md text-label-md text-on-primary/80 hover:text-on-primary py-2 px-3"
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
