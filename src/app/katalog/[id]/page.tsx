"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { PublicNavbar } from "@/components/PublicNavbar";
import { PublicFooter } from "@/components/PublicFooter";
import { useShowroom } from "@/context/ShowroomContext";
import {
  calculateMLPrediction,
  formatNumberID,
  formatRupiah,
} from "@/data/mockShowroomData";

export default function DetailMotorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { motors } = useShowroom();

  const motor =
    motors.find((m) => String(m.id_motor) === id) || motors[0];

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [copiedShare, setCopiedShare] = useState(false);
  const [showWaTooltip, setShowWaTooltip] = useState(false);
  const [showTestDriveModal, setShowTestDriveModal] = useState(false);

  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custDate, setCustDate] = useState("");
  const [custTime, setCustTime] = useState("Pagi (09:00 - 11:30)");

  if (!motor) {
    return null;
  }

  const photos = motor.foto_motor.length > 0 ? motor.foto_motor : [];
  const currentPhoto = photos[activePhotoIndex] || photos[0];

  const mlEstimate = calculateMLPrediction({
    merek: motor.merek,
    tahun: motor.tahun,
    cc: motor.cc,
    kilometer: motor.kilometer,
    kondisi_mesin: motor.kondisi_mesin,
    kelengkapan_dokumen: motor.kelengkapan_dokumen,
    domisili_samsat: motor.domisili_samsat,
    harga_beli: motor.harga_beli,
  });

  const handleCopyShare = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const handleSubmitTestDrive = () => {
    const name = custName.trim() || "Konsumen";
    const phone = custPhone.trim() || "-";
    const date = custDate || "Besok";
    const message = encodeURIComponent(
      `Halo Admin RODA.MOTORKU, saya ingin reservasi Cek Unit & Test Drive:\n` +
        `- Motor: ${motor.merek} ${motor.tipe} ${motor.tahun} (${formatRupiah(
          motor.harga_jual
        )})\n` +
        `- Nama: ${name}\n` +
        `- No HP: ${phone}\n` +
        `- Rencana Kunjungan: ${date} (${custTime})\n` +
        `Mohon konfirmasi kesiapan unit di showroom Otista.`
    );
    setShowTestDriveModal(false);
    window.open(`https://wa.me/6281288903321?text=${message}`, "_blank");
  };

  const waDirectUrl = `https://wa.me/6281288903321?text=${encodeURIComponent(
    `Halo Admin RODA.MOTORKU, saya tertarik dengan unit ${motor.merek} ${
      motor.tipe
    } ${motor.tahun} (${formatRupiah(
      motor.harga_jual
    )}). Apakah unit masih tersedia untuk dilihat di showroom?`
  )}`;

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <PublicNavbar />

      <main className="w-full pt-16 bg-surface flex-1">
        <div className="flex flex-col w-full">
          {/* Top Breadcrumb & Quick Actions Bar */}
          <section className="w-full bg-surface-container-lowest shadow-sm">
            <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin py-space-sm flex flex-wrap items-center justify-between gap-space-sm">
              <nav
                aria-label="Breadcrumb"
                className="flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant"
              >
                <Link
                  className="hover:text-primary transition-colors flex items-center gap-1"
                  href="/"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    home
                  </span>
                  <span>Beranda</span>
                </Link>
                <span className="text-outline-variant font-bold">/</span>
                <Link className="hover:text-primary transition-colors" href="/">
                  Katalog Motor
                </Link>
                <span className="text-outline-variant font-bold">/</span>
                <span className="text-primary font-bold truncate max-w-[200px] sm:max-w-none">
                  {motor.merek} {motor.tipe} {motor.tahun}
                </span>
              </nav>

              <div className="flex items-center gap-space-sm">
                <span className="bg-secondary-container text-on-secondary-container font-label-sm text-label-sm px-space-sm py-1 rounded">
                  SKU: {motor.sku}
                </span>
                <button
                  type="button"
                  onClick={handleCopyShare}
                  className="flex items-center gap-1 text-primary bg-surface-container-low hover:bg-secondary-container px-space-sm py-1 rounded transition-colors font-label-sm text-label-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    share
                  </span>
                  <span>{copiedShare ? "Tersalin!" : "Bagikan"}</span>
                </button>
              </div>
            </div>
          </section>

          {/* Main Showcase Section: 2 Column Layout */}
          <section className="max-w-7xl mx-auto w-full px-margin-mobile md:px-margin py-space-lg">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg lg:gap-space-xl items-start">
              {/* Left Column: Gallery Frame & Thumbnails (5/12 on large screens) */}
              <div className="lg:col-span-5 flex flex-col gap-space-md">
                {/* Main Image Stage Frame */}
                <div className="relative bg-surface-container-lowest rounded-xl overflow-hidden shadow-md group aspect-[4/3] flex items-center justify-center">
                  <img
                    alt={`${motor.merek} ${motor.tipe} - ${currentPhoto?.label}`}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    src={currentPhoto?.nama_file}
                  />
                  {/* Gradient Scrim for Top Badges */}
                  <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/80 to-transparent pointer-events-none"></div>

                  {/* Top Watermark & Metadata Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-space-sm pointer-events-none">
                    <div className="flex items-center gap-1.5 bg-primary-container/95 text-on-primary font-label-sm text-label-sm px-space-sm py-1.5 rounded shadow-sm backdrop-blur-md">
                      <span
                        className="material-symbols-outlined text-[16px] text-tertiary-fixed"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        verified
                      </span>
                      <span className="tracking-wide">
                        RODA.MOTORKU Verified Unit
                      </span>
                    </div>

                    {currentPhoto?.is_utama && (
                      <div className="bg-surface-container-lowest/95 text-primary font-label-sm text-label-sm px-space-sm py-1 rounded shadow-sm flex items-center gap-1 backdrop-blur-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                        <span>Foto Utama (is_utama)</span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Floating Caption */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <span className="bg-inverse-surface/85 text-inverse-on-surface font-label-sm text-label-sm px-2.5 py-1 rounded backdrop-blur-sm shadow-sm">
                      {currentPhoto?.caption}
                    </span>
                    <div className="bg-surface-container-lowest/80 text-on-surface p-1.5 rounded shadow-sm backdrop-blur-sm flex items-center">
                      <span className="material-symbols-outlined text-[18px]">
                        zoom_in
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4 Sub-Thumbnails (foto_motor representation) */}
                <div className="grid grid-cols-4 gap-space-sm">
                  {photos.map((photo, index) => {
                    const isSelected = index === activePhotoIndex;
                    return (
                      <button
                        key={photo.id_foto}
                        type="button"
                        onClick={() => setActivePhotoIndex(index)}
                        className={`group relative aspect-[4/3] rounded-lg overflow-hidden bg-surface-container-low shadow-sm transition-all focus:outline-none cursor-pointer ${
                          isSelected
                            ? "ring-2 ring-primary ring-offset-2 ring-offset-surface opacity-100"
                            : "ring-1 ring-outline-variant hover:ring-primary opacity-80 hover:opacity-100"
                        }`}
                      >
                        <img
                          alt={photo.label}
                          className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                          src={photo.nama_file}
                        />
                        <div
                          className={`absolute inset-x-0 bottom-0 font-label-sm text-[10px] leading-tight py-0.5 text-center truncate px-1 ${
                            isSelected
                              ? "bg-primary/85 text-on-primary"
                              : "bg-inverse-surface/75 text-inverse-on-surface"
                          }`}
                        >
                          {photo.label}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Trust Callout Card for Inspeksi */}
                <div className="bg-surface-container-low rounded-xl p-space-md shadow-sm flex items-start gap-space-md mt-space-xs">
                  <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[24px]">
                      checklist_rtl
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-lg text-label-lg text-primary font-bold">
                      120+ Titik Inspeksi Showroom
                    </span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      Unit telah lolos uji kelayakan rangka bebas keropos,
                      sistem injeksi terkalibrasi, kompresi mesin 100% normal,
                      dan bukan bekas tabrakan atau banjir.
                    </p>
                  </div>
                </div>

                {/* ML Valuation Confidence Widget */}
                <div className="bg-secondary-container/40 rounded-xl p-space-md shadow-sm flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-label-md text-label-md text-primary font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[18px]">
                        query_stats
                      </span>
                      Taksiran Pasar RODA.AI ({motor.domisili_samsat})
                    </span>
                    <span className="bg-surface-container-lowest text-primary font-label-sm text-label-sm px-2 py-0.5 rounded shadow-sm">
                      R² {mlEstimate.r2Score}%
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-secondary-container">
                    Rentang harga wajar tipe{" "}
                    <strong>
                      {motor.merek} {motor.tipe} {motor.tahun}
                    </strong>{" "}
                    menurut model Random Forest adalah{" "}
                    <strong>
                      {formatRupiah(mlEstimate.rangeLow)} -{" "}
                      {formatRupiah(mlEstimate.rangeHigh)}
                    </strong>
                    . Unit ini dibanderol sangat kompetitif sesuai kondisi fisik
                    dan kelengkapan dokumen.
                  </p>
                </div>
              </div>

              {/* Right Column: Specs Table, Price & WhatsApp Conversion (7/12 on large screens) */}
              <div className="lg:col-span-7 flex flex-col gap-space-md">
                {/* Header & Status Area */}
                <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-sm">
                  <div className="flex flex-wrap items-center justify-between gap-space-sm">
                    <div className="flex items-center gap-space-sm">
                      <span className="bg-tertiary-container text-tertiary-fixed font-label-md text-label-md px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-tertiary-fixed animate-ping"></span>
                        <span>{motor.status}</span>
                      </span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                        Grade A • Non-Oplosan • Siap Pakai
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm">
                      <span className="material-symbols-outlined text-[16px]">
                        visibility
                      </span>
                      <span>Dilihat {motor.views_week} kali pekan ini</span>
                    </div>
                  </div>

                  {/* Main Vehicle Title */}
                  <h1 className="font-headline-lg text-headline-lg text-primary font-bold tracking-tight">
                    {motor.merek} {motor.tipe} {motor.tahun}
                  </h1>

                  {/* Pricing Section */}
                  <div className="bg-surface-container-low rounded-lg p-space-md flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mt-space-xs">
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                        Harga Tunai Showroom
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="font-currency-stat text-currency-stat text-primary font-bold tabular-nums">
                          {formatRupiah(motor.harga_jual)}
                        </span>
                        {motor.harga_pasar_coret && (
                          <span className="line-through text-outline font-label-md text-label-md tabular-nums">
                            {formatRupiah(motor.harga_pasar_coret)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="sm:text-right">
                      <span className="inline-block bg-primary-container text-on-primary font-label-sm text-label-sm px-2.5 py-1 rounded">
                        Harga pas showroom (Nego tipis di tempat)
                      </span>
                      <p className="font-body-sm text-[12px] text-on-surface-variant mt-1">
                        Bisa tukar tambah motor lama Anda
                      </p>
                    </div>
                  </div>
                </div>

                {/* High-Detail Specifications Table (9 Mandatory Rows matching Proposal & UI/UX) */}
                <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-sm">
                  <div className="flex items-center justify-between pb-space-xs">
                    <h2 className="font-headline-sm text-headline-sm text-primary font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">
                        tune
                      </span>
                      Spesifikasi Lengkap Unit
                    </h2>
                    <span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
                      Data Resmi Showroom ({motor.nopol})
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-lg">
                    <table className="w-full text-left font-body-md text-body-md">
                      <tbody className="divide-none">
                        {/* 1. Merek */}
                        <tr className="bg-surface-container-low hover:bg-surface-container transition-colors">
                          <td className="py-3 px-4 font-label-md text-label-md text-secondary w-1/3 sm:w-2/5">
                            1. Merek
                          </td>
                          <td className="py-3 px-4 font-label-lg text-label-lg text-on-surface font-semibold">
                            {motor.merek}
                          </td>
                        </tr>
                        {/* 2. Tahun */}
                        <tr className="bg-surface-container-lowest hover:bg-surface-container transition-colors">
                          <td className="py-3 px-4 font-label-md text-label-md text-secondary">
                            2. Tahun Pembuatan
                          </td>
                          <td className="py-3 px-4 font-body-md text-body-md text-on-surface font-medium">
                            {motor.tahun} (Perakitan &amp; Registrasi Asli)
                          </td>
                        </tr>
                        {/* 3. Kapasitas Mesin */}
                        <tr className="bg-surface-container-low hover:bg-surface-container transition-colors">
                          <td className="py-3 px-4 font-label-md text-label-md text-secondary">
                            3. Kapasitas Mesin (cc)
                          </td>
                          <td className="py-3 px-4 font-body-md text-body-md text-on-surface font-medium">
                            {motor.cc} cc (Injeksi Standar Pabrikan)
                          </td>
                        </tr>
                        {/* 4. Kilometer */}
                        <tr className="bg-surface-container-lowest hover:bg-surface-container transition-colors">
                          <td className="py-3 px-4 font-label-md text-label-md text-secondary">
                            4. Kilometer
                          </td>
                          <td className="py-3 px-4 font-label-lg text-label-lg text-primary font-bold flex items-center gap-1.5 tabular-nums">
                            <span>{formatNumberID(motor.kilometer)} km</span>
                            <span className="bg-secondary-container text-on-secondary-container font-label-sm text-label-sm px-1.5 py-0.5 rounded text-[11px] font-normal">
                              {motor.kilometer < 15000
                                ? "Rendah / Jarang Pakai"
                                : "Pemakaian Normal"}
                            </span>
                          </td>
                        </tr>
                        {/* 5. Kondisi Mesin */}
                        <tr className="bg-surface-container-low hover:bg-surface-container transition-colors">
                          <td className="py-3 px-4 font-label-md text-label-md text-secondary align-top">
                            5. Kondisi Mesin
                          </td>
                          <td className="py-3 px-4 font-body-md text-body-md text-on-surface">
                            <span className="font-bold text-tertiary-container bg-tertiary-fixed/30 px-2 py-0.5 rounded">
                              {motor.kondisi_mesin}
                            </span>
                            <span className="block mt-1 text-on-surface-variant font-body-sm text-body-sm">
                              Suara mesin halus, rutin servis berkala, bebas
                              rembes oli.
                            </span>
                          </td>
                        </tr>
                        {/* 6. Kelengkapan Dokumen */}
                        <tr className="bg-surface-container-lowest hover:bg-surface-container transition-colors">
                          <td className="py-3 px-4 font-label-md text-label-md text-secondary align-top">
                            6. Kelengkapan Dokumen
                          </td>
                          <td className="py-3 px-4 font-body-md text-body-md text-on-surface">
                            <div className="flex items-center gap-1 text-primary font-bold">
                              <span
                                className="material-symbols-outlined text-[18px] text-tertiary-container"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                              >
                                check_circle
                              </span>
                              <span>{motor.kelengkapan_dokumen}</span>
                            </div>
                            <span className="text-on-surface-variant font-body-sm text-body-sm block mt-0.5">
                              Nomor rangka &amp; mesin sesuai fisik dokumen
                              Samsat.
                            </span>
                          </td>
                        </tr>
                        {/* 7. Domisili Samsat */}
                        <tr className="bg-surface-container-low hover:bg-surface-container transition-colors">
                          <td className="py-3 px-4 font-label-md text-label-md text-secondary">
                            7. Domisili Samsat
                          </td>
                          <td className="py-3 px-4 font-body-md text-body-md text-on-surface">
                            <span className="font-semibold text-primary">
                              {motor.domisili_samsat}
                            </span>
                            <span className="text-on-surface-variant font-body-sm text-body-sm">
                              {" "}
                              • {motor.pajak_info}
                            </span>
                          </td>
                        </tr>
                        {/* 8. Deskripsi Tambahan */}
                        <tr className="bg-surface-container-lowest hover:bg-surface-container transition-colors">
                          <td className="py-3 px-4 font-label-md text-label-md text-secondary align-top">
                            8. Deskripsi Tambahan
                          </td>
                          <td className="py-3 px-4 font-body-md text-body-md text-on-surface-variant leading-relaxed">
                            &ldquo;{motor.deskripsi}&rdquo;
                          </td>
                        </tr>
                        {/* 9. Status Ketersediaan */}
                        <tr className="bg-surface-container-low hover:bg-surface-container transition-colors">
                          <td className="py-3 px-4 font-label-md text-label-md text-secondary">
                            9. Status Ketersediaan
                          </td>
                          <td className="py-3 px-4 font-label-md text-label-md text-primary font-bold">
                            <span className="inline-flex items-center gap-1.5 text-on-primary bg-primary px-2.5 py-1 rounded">
                              <span className="material-symbols-outlined text-[16px]">
                                storefront
                              </span>
                              Unit {motor.status} di Showroom RODA.MOTORKU
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* WhatsApp Action Button & Interactive Tooltip/Popup */}
                <div className="relative bg-surface-container-lowest rounded-xl p-space-lg shadow-md flex flex-col gap-space-sm">
                  <div className="relative w-full">
                    <a
                      href={waDirectUrl}
                      onMouseEnter={() => setShowWaTooltip(true)}
                      onMouseLeave={() => setShowWaTooltip(false)}
                      rel="noopener noreferrer"
                      target="_blank"
                      className="w-full flex items-center justify-center gap-space-sm bg-[#2E7D32] hover:bg-[#236327] text-white py-3.5 px-space-lg rounded-xl shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 font-label-lg text-label-lg font-bold text-center"
                    >
                      <svg
                        className="w-6 h-6 fill-current shrink-0"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12.031 2C6.504 2 2.016 6.488 2.016 12.016c0 1.838.502 3.56 1.378 5.043L2 22l5.105-1.336A9.97 9.97 0 0 0 12.031 22C17.558 22 22.046 17.512 22.046 12.016 22.046 6.488 17.558 2 12.031 2zm5.727 14.156c-.238.67-1.182 1.282-1.637 1.328-.432.043-.997.199-3.232-.73-2.684-1.116-4.394-3.856-4.529-4.037-.134-.18-1.092-1.455-1.092-2.775 0-1.32.693-1.968.939-2.235.247-.267.538-.334.717-.334.18 0 .36.002.516.01.168.008.39-.064.61.464.226.541.77 1.874.836 2.01.068.135.112.293.022.473-.09.18-.135.293-.27.45-.134.158-.283.352-.405.473-.134.135-.274.281-.118.55.157.269.697 1.15 1.496 1.862 1.028.916 1.895 1.2 2.164 1.335.27.135.426.113.584-.068.157-.18.673-.788.852-1.057.18-.27.359-.225.597-.135.239.09 1.517.714 1.776.843.258.13.431.192.494.301.062.11.062.639-.176 1.309z" />
                      </svg>
                      <span>Hubungi Showroom via WhatsApp</span>
                    </a>

                    {showWaTooltip && (
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface font-label-md text-label-md px-3.5 py-1.5 rounded-lg shadow-xl z-20 pointer-events-none whitespace-nowrap flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-tertiary-fixed">
                          call
                        </span>
                        <span>
                          Nomor Resmi Admin: <strong>0812-8890-3321</strong>{" "}
                          (Fast Response 08:30-18:00)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Secondary Actions: Jadwalkan Test Drive & Lokasi Unit */}
                  <div className="grid grid-cols-2 gap-space-sm pt-space-xs">
                    <button
                      type="button"
                      onClick={() => setShowTestDriveModal(true)}
                      className="flex items-center justify-center gap-1.5 bg-surface-container-low hover:bg-secondary-container text-primary font-label-md text-label-md py-2.5 px-space-sm rounded-lg transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        calendar_month
                      </span>
                      <span>Jadwalkan Test Drive</span>
                    </button>
                    <a
                      href="#showroomLocationSection"
                      className="flex items-center justify-center gap-1.5 bg-surface-container-low hover:bg-secondary-container text-primary font-label-md text-label-md py-2.5 px-space-sm rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        location_on
                      </span>
                      <span>Lihat Lokasi Showroom</span>
                    </a>
                  </div>

                  {/* Mandatory Safety & Anti-Fraud Notice */}
                  <div className="bg-error-container/20 rounded-lg p-space-sm flex items-start gap-space-xs mt-space-xs">
                    <span className="material-symbols-outlined text-[20px] text-error shrink-0">
                      shield_lock
                    </span>
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md text-error font-bold">
                        Catatan Keamanan Transaksi
                      </span>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Sesuai batasan sistem RODA.MOTORKU, website ini tidak
                        melayani pembayaran daring. Silakan datang langsung ke
                        showroom untuk cek unit dan test drive.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Interactive Test Drive Dialog Modal */}
          {showTestDriveModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/50 backdrop-blur-sm p-margin-mobile">
              <div className="bg-surface-container-lowest w-full max-w-lg rounded-xl p-space-lg shadow-xl flex flex-col gap-space-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[24px]">
                      two_wheeler
                    </span>
                    <h3 className="font-headline-sm text-headline-sm text-primary font-bold">
                      Jadwalkan Test Drive
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowTestDriveModal(false)}
                    className="text-on-surface-variant hover:text-primary cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[22px]">
                      close
                    </span>
                  </button>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Silakan isi data kedatangan untuk memastikan kunci dan unit{" "}
                  <strong>
                    {motor.merek} {motor.tipe} {motor.tahun}
                  </strong>{" "}
                  disiapkan oleh teknisi showroom saat Anda tiba.
                </p>
                <div className="flex flex-col gap-space-sm">
                  <div>
                    <label className="block font-label-md text-label-md text-on-surface mb-1">
                      Nama Lengkap Sesuai KTP
                    </label>
                    <input
                      value={custName}
                      onChange={(e) => setCustName(e.target.value)}
                      className="w-full bg-surface-container-low px-3 py-2 rounded-lg text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Contoh: Hendra Wijaya"
                      type="text"
                    />
                  </div>
                  <div>
                    <label className="block font-label-md text-label-md text-on-surface mb-1">
                      Nomor WhatsApp Aktif
                    </label>
                    <input
                      value={custPhone}
                      onChange={(e) => setCustPhone(e.target.value)}
                      className="w-full bg-surface-container-low px-3 py-2 rounded-lg text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Contoh: 081288990011"
                      type="tel"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-space-sm">
                    <div>
                      <label className="block font-label-md text-label-md text-on-surface mb-1">
                        Rencana Tanggal
                      </label>
                      <input
                        value={custDate}
                        onChange={(e) => setCustDate(e.target.value)}
                        className="w-full bg-surface-container-low px-3 py-2 rounded-lg text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                        type="date"
                      />
                    </div>
                    <div>
                      <label className="block font-label-md text-label-md text-on-surface mb-1">
                        Jam Kedatangan
                      </label>
                      <select
                        value={custTime}
                        onChange={(e) => setCustTime(e.target.value)}
                        className="w-full bg-surface-container-low px-3 py-2 rounded-lg text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="Pagi (09:00 - 11:30)">
                          Pagi (09:00 - 11:30)
                        </option>
                        <option value="Siang (13:00 - 15:00)">
                          Siang (13:00 - 15:00)
                        </option>
                        <option value="Sore (15:30 - 17:30)">
                          Sore (15:30 - 17:30)
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-space-sm pt-space-xs">
                  <button
                    type="button"
                    onClick={() => setShowTestDriveModal(false)}
                    className="px-space-md py-2 text-secondary font-label-md text-label-md hover:bg-surface-container rounded-lg cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitTestDrive}
                    className="px-space-md py-2 bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md rounded-lg shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      send
                    </span>
                    Konfirmasi via WA
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Physical Showroom Location & Floor Inspection Guidelines */}
          <section
            id="showroomLocationSection"
            className="w-full bg-surface-container-low mt-space-xl py-space-xl"
          >
            <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin flex flex-col gap-space-lg">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-sm">
                <div>
                  <span className="font-label-md text-label-md text-primary font-bold uppercase tracking-wider">
                    Lokasi Fisik &amp; Kunjungan
                  </span>
                  <h2 className="font-headline-lg text-headline-lg text-primary font-bold">
                    Cek Langsung Motor di Showroom Kami
                  </h2>
                </div>
                <div className="flex items-center gap-space-sm text-on-surface-variant font-label-md text-label-md">
                  <span className="w-2.5 h-2.5 rounded-full bg-on-tertiary-container"></span>
                  <span>Buka Setiap Hari (08:30 - 18:00 WIB)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
                <div className="lg:col-span-8 overflow-hidden rounded-xl shadow-sm bg-surface-container-lowest flex flex-col">
                  <div
                    className="w-full h-72 md:h-80 bg-cover bg-center"
                    style={{
                      backgroundImage:
                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBuV-N7S27UeP5_flkgYjwHcXsfoHtOfN2wxvbl8ywshXkRvl9MK2JTKoW2CI5bYH8c_Jt21njQhe3HUHuHNY3vYlPjXc-IQBO_k6V2GE2kmoYGCqa848gVpxbP0i0lpJrSxAdU9qn5gnUKuL2Tt-axagKExgW1MC71k9gmHnGq-C587JFISmBKafuTMN9q4GjAjlSEzENBTqM7nOFTHqq8nbvl3XRSccgcFdyAkz_h')",
                    }}
                  />
                  <div className="p-space-md flex flex-wrap items-center justify-between gap-space-sm bg-surface-container-lowest">
                    <div>
                      <p className="font-label-lg text-label-lg text-primary font-bold">
                        RODA.MOTORKU Showroom Pusat - Otista
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Jl. Raya Otista No. 142, Bidara Cina, Jatinegara,
                        Jakarta Timur (Dekat Halte Busway Gelanggang Remaja)
                      </p>
                    </div>
                    <a
                      className="inline-flex items-center gap-1.5 bg-primary text-on-primary px-space-md py-2 rounded-lg font-label-md text-label-md hover:bg-primary-container transition-colors shadow-sm"
                      href="https://maps.google.com/?q=Otista+Jatinegara+Jakarta+Timur"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        navigation
                      </span>
                      <span>Buka Google Maps</span>
                    </a>
                  </div>
                </div>

                <div className="lg:col-span-4 bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between gap-space-md">
                  <div>
                    <h4 className="font-headline-sm text-headline-sm text-primary font-bold mb-space-sm">
                      Panduan Cek Fisik
                    </h4>
                    <div className="flex flex-col gap-space-md">
                      <div className="flex items-start gap-space-sm">
                        <span className="w-6 h-6 rounded-full bg-secondary-container text-primary font-bold text-center text-[12px] flex items-center justify-center shrink-0">
                          1
                        </span>
                        <div>
                          <span className="font-label-md text-label-md text-on-surface font-bold">
                            Cek Kesesuaian Nomor Rangka
                          </span>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">
                            Nomor rangka &amp; mesin dicocokkan bersama tim staf
                            kami langsung dengan lembar BPKB asli.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-space-sm">
                        <span className="w-6 h-6 rounded-full bg-secondary-container text-primary font-bold text-center text-[12px] flex items-center justify-center shrink-0">
                          2
                        </span>
                        <div>
                          <span className="font-label-md text-label-md text-on-surface font-bold">
                            Bawa Mekanik Kepercayaan
                          </span>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">
                            Konsumen dipersilakan membawa montir bengkel rekanan
                            sendiri untuk pengecekan menyeluruh.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-space-sm">
                        <span className="w-6 h-6 rounded-full bg-secondary-container text-primary font-bold text-center text-[12px] flex items-center justify-center shrink-0">
                          3
                        </span>
                        <div>
                          <span className="font-label-md text-label-md text-on-surface font-bold">
                            Garansi Mesin 30 Hari
                          </span>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">
                            Setiap transaksi didampingi kwitansi resmi
                            bermaterai dengan garansi mesin 1 bulan.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-surface-container-low p-space-sm rounded-lg flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">
                      support_agent
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Ada pertanyaan sebelum berkunjung? Kontak WhatsApp siap
                      sedia.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
