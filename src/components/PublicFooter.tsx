import React from "react";
import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="w-full bg-primary py-space-xl text-on-primary">
      <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-xl">
          <div className="flex flex-col gap-space-sm">
            <div className="flex items-center gap-space-sm">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center overflow-hidden shadow-xs">
                <img src="/logo.png" alt="RODA.MOTORKU" className="w-full h-full object-contain" />
              </div>
              <span className="font-headline-sm text-headline-sm font-bold tracking-tight text-on-primary">
                RODA<span className="text-secondary">.MOTORKU</span>
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-primary/75 max-w-sm">
              Pusat jual beli sepeda motor bekas terpercaya untuk konsumen di sekitar Nganjuk &amp; Jawa Timur.
              Seluruh unit melalui inspeksi teknis menyeluruh, dokumen lengkap (STNK + BPKB), dan bergaransi resmi.
            </p>
          </div>

          <div id="kontak-showroom" className="flex flex-col gap-space-sm">
            <span className="font-label-lg text-label-lg text-on-primary font-bold">
              Showroom &amp; Lokasi Fisik
            </span>
            <p className="font-body-sm text-body-sm text-on-primary/75">
              Gondang Timur, Gondang, Kec. Pace, Kabupaten Nganjuk, Jawa Timur
            </p>
            <p className="font-body-sm text-body-sm text-on-primary/75">
              Senin - Minggu: 08:30 - 18:00 WIB
            </p>
          </div>

          <div className="flex flex-col gap-space-sm">
            <span className="font-label-lg text-label-lg text-on-primary font-bold">
              Layanan Konsumen &amp; WhatsApp
            </span>
            <p className="font-body-sm text-body-sm text-on-primary/75">
              WhatsApp Admin: +62 856-0898-1265
            </p>
            <p className="font-body-sm text-body-sm text-on-primary/75">
              Email: alhabib.husein13@gmail.com
            </p>
            <p className="font-label-sm text-label-sm text-on-primary/60">
              Konsultasi unit, negosiasi harga, dan booking test-drive langsung via WhatsApp.
            </p>
          </div>
        </div>

        <div className="mt-space-xl pt-space-lg border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-space-sm text-center sm:text-left font-label-sm text-label-sm text-on-primary/70">
          <span>© 2026 RODA.MOTORKU Indonesia — Sistem Informasi Manajemen Katalog &amp; Penentuan Harga Jual Motor Bekas.</span>
          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-on-primary/70 hover:text-secondary transition-colors font-medium"
          >
            <span className="material-symbols-outlined text-[15px]">lock</span>
            <span>Akses Login Admin</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
