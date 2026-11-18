import React from "react";
import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="w-full bg-surface-container border-t border-outline-variant/30 py-space-xl text-on-surface">
      <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-xl">
          <div className="flex flex-col gap-space-sm">
            <div className="flex items-center gap-space-xs">
              <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-[20px]">
                  two_wheeler
                </span>
              </div>
              <span className="font-headline-sm text-headline-sm font-bold tracking-tight text-primary">
                RODA<span className="text-secondary">.MOTORKU</span>
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm">
              Pusat jual beli sepeda motor bekas terpercaya untuk konsumen di sekitar Nganjuk &amp; Jawa Timur.
              Seluruh unit melalui inspeksi teknis menyeluruh, dokumen lengkap (STNK + BPKB), dan bergaransi resmi.
            </p>
          </div>

          <div id="kontak-showroom" className="flex flex-col gap-space-sm">
            <span className="font-label-lg text-label-lg text-on-surface font-bold">
              Showroom &amp; Lokasi Fisik
            </span>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Gondang Timur, Gondang, Kec. Pace, Kabupaten Nganjuk, Jawa Timur
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Senin - Minggu: 08:30 - 18:00 WIB
            </p>
          </div>

          <div className="flex flex-col gap-space-sm">
            <span className="font-label-lg text-label-lg text-on-surface font-bold">
              Layanan Konsumen &amp; WhatsApp
            </span>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              WhatsApp Admin: +62 856-0898-1265
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Email: alhabib.husein13@gmail.com
            </p>
            <p className="font-label-sm text-label-sm text-on-surface-variant/80">
              Konsultasi unit, negosiasi harga, dan booking test-drive langsung via WhatsApp.
            </p>
          </div>
        </div>

        <div className="mt-space-xl pt-space-lg border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-space-sm text-center sm:text-left font-label-sm text-label-sm text-on-surface-variant">
          <span>© 2026 RODA.MOTORKU Indonesia — Sistem Informasi Manajemen Katalog &amp; Penentuan Harga Jual Motor Bekas.</span>
          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors font-medium"
          >
            <span className="material-symbols-outlined text-[15px]">lock</span>
            <span>Akses Login Admin</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
