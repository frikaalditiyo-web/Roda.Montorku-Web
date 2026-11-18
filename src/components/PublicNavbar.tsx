"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function PublicNavbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-surface-container-lowest/90 backdrop-blur-md shadow-xs border-b border-outline-variant/30">
      <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-space-xs group">
          <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 duration-200">
            <span className="material-symbols-outlined text-[20px]">
              two_wheeler
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm font-bold tracking-tight text-primary leading-none">
              RODA<span className="text-secondary">.MOTORKU</span>
            </span>
            <span className="font-label-sm text-[10px] text-on-surface-variant font-medium tracking-wide">
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
                ? "transition-colors bg-primary text-on-primary rounded font-label-md text-label-md px-space-md py-space-xs"
                : "font-label-md text-label-md text-on-primary-container hover:text-on-primary transition-colors px-space-sm py-space-xs"
            }
          >
            Katalog Motor
          </Link>
          <a
            href="/#katalog-unit"
            className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors px-space-sm py-space-xs"
          >
            Unit Tersedia
          </a>
          <a
            href="/#kontak-showroom"
            className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors px-space-sm py-space-xs"
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
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-variant text-primary font-label-sm text-label-sm font-semibold transition-colors border border-outline-variant/40"
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
            className="md:hidden w-9 h-9 rounded-lg bg-surface-container text-on-surface flex items-center justify-center border border-outline-variant/30"
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
        <div className="md:hidden bg-surface-container-lowest border-t border-outline-variant/30 px-margin-mobile py-space-md flex flex-col gap-space-sm shadow-md">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="font-label-md text-label-md text-on-surface py-2 px-3 rounded bg-surface-container"
          >
            Katalog Motor
          </Link>
          <a
            href="/#katalog-unit"
            onClick={() => setMobileMenuOpen(false)}
            className="font-label-md text-label-md text-on-surface-variant hover:text-primary py-2 px-3"
          >
            Unit Tersedia
          </a>
          <a
            href="/#kontak-showroom"
            onClick={() => setMobileMenuOpen(false)}
            className="font-label-md text-label-md text-on-surface-variant hover:text-primary py-2 px-3"
          >
            Kontak &amp; Lokasi Showroom
          </a>
          <Link
            href="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="font-label-md text-label-md text-primary font-semibold py-2 px-3 rounded bg-secondary-container flex items-center justify-between mt-1"
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
