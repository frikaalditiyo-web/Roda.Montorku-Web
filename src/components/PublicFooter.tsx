import React from "react";
import Link from "next/link";

export function PublicFooter() {
  return (
    <footer
      id="kontak-showroom"
      className="w-full bg-surface-container-low shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-t border-surface-container-high"
    >
      <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin py-space-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-xl">
          <div className="flex flex-col gap-space-sm">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary text-[16px]">
                  two_wheeler
                </span>
              </div>
              <span className="font-headline-sm text-headline-sm text-primary font-bold">
                RODA.MOTORKU
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              Pusat bursa sepeda motor bekas terpercaya untuk showroom UMKM dan
              konsumen di seluruh Indonesia. Terverifikasi, transparan dengan
              dukungan estimasi harga Machine Learning, dan bergaransi resmi
              showroom.
            </p>
          </div>

          <div className="flex flex-col gap-space-sm">
            <span className="font-label-lg text-label-lg text-on-surface font-bold">
              Lokasi Showroom Pusat
            </span>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Jl. Raya Otista No. 142, Jatinegara, Jakarta Timur, DKI Jakarta
              13330
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
              WhatsApp Admin: +62 812-8890-3321
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Email: info@rodamotorku.co.id
            </p>
            <div className="pt-1">
              <Link
                href="/login"
                className="inline-flex items-center gap-1 font-label-sm text-label-sm text-primary hover:underline"
              >
                <span className="material-symbols-outlined text-[15px]">
                  lock
                </span>
                <span>Portal Pengelola / Admin Showroom</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-space-xl pt-space-lg border-t border-outline-variant/30 text-center font-label-sm text-label-sm text-on-surface-variant">
          © 2026 RODA.MOTORKU Indonesia — Capstone Project Program Studi
          Informatika UNP Kediri.
        </div>
      </div>
    </footer>
  );
}
