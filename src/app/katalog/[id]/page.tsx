"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { PublicNavbar } from "@/components/PublicNavbar";
import { PublicFooter } from "@/components/PublicFooter";
import { useShowroom } from "@/context/ShowroomContext";
import {
  calculateMLPrediction,
  formatNumberID,
  formatRupiah,
  Motor,
} from "@/data/mockShowroomData";

function DetailMotorContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { motors } = useShowroom();
  const [fetchedMotor, setFetchedMotor] = useState<Motor | null>(null);

  useEffect(() => {
    // Record view in background
    fetch(`/api/motor/${id}/view`, { method: "POST" }).catch(() => {});

    const existing = motors.find((m) => String(m.id_motor) === id);
    if (existing) {
      setFetchedMotor(existing);
    } else {
      fetch(`/api/motor/${id}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            setFetchedMotor(json.data);
          }
        })
        .catch(() => {});
    }
  }, [id, motors]);

  const motor = fetchedMotor || motors.find((m) => String(m.id_motor) === id) || motors[0];

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [copiedShare, setCopiedShare] = useState(false);
  const [showWaTooltip, setShowWaTooltip] = useState(false);
  const [showTestDriveModal, setShowTestDriveModal] = useState(false);
  const [isReserving, setIsReserving] = useState(false);

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
      `Halo Admin Roda.Motorku, saya ingin reservasi Cek Unit & Test Drive:\n` +
        `- Motor: ${motor.merek} ${motor.tipe} ${motor.tahun} (${formatRupiah(
          motor.harga_jual
        )})\n` +
        `- Nama: ${name}\n` +
        `- No HP: ${phone}\n` +
        `- Rencana Kunjungan: ${date} (${custTime})\n` +
        `Mohon konfirmasi kesiapan unit di showroom.`
    );
    setIsReserving(true);
    setTimeout(() => {
      setIsReserving(false);
      setShowTestDriveModal(false);
      window.open(`https://wa.me/6285608981265?text=${message}`, "_blank");
    }, 450);
  };

  const waDirectUrl = `https://wa.me/6285608981265?text=${encodeURIComponent(
    `Halo Admin Roda.Motorku, saya tertarik dengan unit ${motor.merek} ${
      motor.tipe
    } ${motor.tahun} (${formatRupiah(
      motor.harga_jual
    )}). Apakah unit masih tersedia untuk dilihat di showroom?`
  )}`;

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <PublicNavbar />

      <main className="w-full pt-20 sm:pt-24 bg-surface flex-1">
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
                  <span>Katalog</span>
                </Link>
                <span className="text-outline-variant font-bold">/</span>
                <span className="text-primary font-bold truncate max-w-[200px] sm:max-w-none">
                  {motor.merek} {motor.tipe} {motor.tahun}
                </span>
              </nav>

              <div className="flex items-center gap-space-sm">
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
                  <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-primary/70 to-transparent pointer-events-none"></div>

                  {/* Top Watermark & Metadata Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-space-sm pointer-events-none">
                    <div className="flex items-center gap-1.5 bg-primary-container/95 text-on-primary font-label-sm text-label-sm px-space-sm py-1 rounded shadow-sm backdrop-blur-md">
                      <span
                        className="material-symbols-outlined text-[15px] text-tertiary-fixed"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        verified
                      </span>
                      <span>Unit Terverifikasi</span>
                    </div>

                    {currentPhoto?.is_utama && (
                      <div className="bg-surface-container-lowest/95 text-primary font-label-sm text-label-sm px-space-sm py-1 rounded shadow-sm flex items-center gap-1 backdrop-blur-md">
                        <span>Foto Utama</span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Floating Caption */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <span className="bg-inverse-surface/85 text-inverse-on-surface font-label-sm text-label-sm px-2.5 py-1 rounded backdrop-blur-sm shadow-sm">
                      {currentPhoto?.label}
                    </span>
                  </div>
                </div>

                {/* 4 Sub-Thumbnails */}
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
                    <span className="material-symbols-outlined text-[22px]">
                      checklist_rtl
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-lg text-label-lg text-primary font-bold">
                      Lulus Inspeksi Showroom
                    </span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      Rangka, mesin, dan kelistrikan normal serta bebas bekas
                      tabrakan atau banjir.
                    </p>
                  </div>
                </div>

                {/* ML Valuation Confidence Widget */}
                <div className="bg-secondary-container/40 rounded-xl p-space-md shadow-sm flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-label-md text-label-md text-primary font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[18px]">
                        query_stats
                      </span>
                      Estimasi Pasar ML
                    </span>
                    <span className="bg-surface-container-lowest text-primary font-label-sm text-label-sm px-2 py-0.5 rounded shadow-sm">
                      R² {mlEstimate.r2Score}%
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-secondary-container">
                    Rentang harga pasar wajar:{" "}
                    <strong>
                      {formatRupiah(mlEstimate.rangeLow)} –{" "}
                      {formatRupiah(mlEstimate.rangeHigh)}
                    </strong>
                  </p>
                </div>
              </div>

              {/* Right Column: Specs Table, Price & WhatsApp Conversion (7/12 on large screens) */}
              <div className="lg:col-span-7 flex flex-col gap-space-md">
                {/* Header & Status Area */}
                <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-sm">
                  <div className="flex flex-wrap items-center justify-between gap-space-sm">
                    <span className="bg-tertiary-container text-tertiary-fixed font-label-md text-label-md px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-tertiary-fixed"></span>
                      <span>{motor.status}</span>
                    </span>
                    <span className="text-on-surface-variant font-label-sm text-label-sm">
                      {motor.nopol} • {motor.domisili_samsat}
                    </span>
                  </div>

                  {/* Main Vehicle Title */}
                  <h1 className="font-headline-lg text-headline-lg text-primary font-bold tracking-tight">
                    {motor.merek} {motor.tipe} {motor.tahun}
                  </h1>

                  {/* Pricing Section */}
                  <div className="bg-surface-container-low rounded-lg p-space-md flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mt-space-xs">
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                        Harga Tunai
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
                  </div>
                </div>

                {/* High-Detail Specifications Table */}
                <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-sm">
                  <div className="flex items-center justify-between pb-space-xs">
                    <h2 className="font-headline-sm text-headline-sm text-primary font-bold">
                      Spesifikasi Unit
                    </h2>
                  </div>

                  <div className="overflow-x-auto rounded-lg border border-surface-container">
                    <table className="w-full text-left text-[13px]">
                      <thead>
                        <tr className="bg-primary text-on-primary text-[12px] uppercase tracking-wider">
                          <th className="py-2.5 px-4 font-semibold w-1/3 sm:w-2/5">
                            Parameter
                          </th>
                          <th className="py-2.5 px-4 font-semibold">
                            Keterangan Unit
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-container">
                        <tr className="bg-surface-container-low">
                          <td className="py-2.5 px-4 font-semibold text-primary w-1/3 sm:w-2/5">
                            Merek
                          </td>
                          <td className="py-2.5 px-4 text-on-surface font-semibold">
                            {motor.merek}
                          </td>
                        </tr>
                        <tr className="bg-surface-container-lowest">
                          <td className="py-2.5 px-4 font-semibold text-primary">
                            Tahun Pembuatan
                          </td>
                          <td className="py-2.5 px-4 text-on-surface font-medium">
                            {motor.tahun}
                          </td>
                        </tr>
                        <tr className="bg-surface-container-low">
                          <td className="py-2.5 px-4 font-semibold text-primary">
                            Kapasitas Mesin
                          </td>
                          <td className="py-2.5 px-4 text-on-surface font-medium">
                            {motor.cc} cc
                          </td>
                        </tr>
                        <tr className="bg-surface-container-lowest">
                          <td className="py-2.5 px-4 font-semibold text-primary">
                            Kilometer
                          </td>
                          <td className="py-2.5 px-4 text-primary font-semibold tabular-nums">
                            {formatNumberID(motor.kilometer)} km
                          </td>
                        </tr>
                        <tr className="bg-surface-container-low">
                          <td className="py-2.5 px-4 font-semibold text-primary">
                            Kondisi Mesin
                          </td>
                          <td className="py-2.5 px-4 text-on-surface">
                            <span className="font-semibold text-tertiary-container">
                              {motor.kondisi_mesin}
                            </span>
                          </td>
                        </tr>
                        <tr className="bg-surface-container-lowest">
                          <td className="py-2.5 px-4 font-semibold text-primary">
                            Kelengkapan Dokumen
                          </td>
                          <td className="py-2.5 px-4 text-on-surface font-medium">
                            {motor.kelengkapan_dokumen}
                          </td>
                        </tr>
                        <tr className="bg-surface-container-low">
                          <td className="py-2.5 px-4 font-semibold text-primary">
                            Domisili Samsat
                          </td>
                          <td className="py-2.5 px-4 text-on-surface">
                            <span className="font-medium text-primary">
                              {motor.domisili_samsat}
                            </span>
                            <span className="text-on-surface-variant text-[12px]">
                              {" "}
                              • {motor.pajak_info}
                            </span>
                          </td>
                        </tr>
                        <tr className="bg-surface-container-lowest">
                          <td className="py-2.5 px-4 font-semibold text-primary align-top">
                            Deskripsi
                          </td>
                          <td className="py-2.5 px-4 text-on-surface-variant leading-relaxed">
                            {motor.deskripsi}
                          </td>
                        </tr>
                        <tr className="bg-surface-container-low">
                          <td className="py-2.5 px-4 font-semibold text-primary">
                            Status
                          </td>
                          <td className="py-2.5 px-4 text-primary font-semibold">
                            {motor.status}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* WhatsApp Action Button & Secondary Actions */}
                <div className="relative bg-surface-container-lowest rounded-xl p-space-lg shadow-md flex flex-col gap-space-sm">
                  <div className="relative w-full">
                    <a
                      href={waDirectUrl}
                      onMouseEnter={() => setShowWaTooltip(true)}
                      onMouseLeave={() => setShowWaTooltip(false)}
                      rel="noopener noreferrer"
                      target="_blank"
                      className="w-full flex items-center justify-center gap-space-sm bg-primary hover:bg-primary-container text-white py-3.5 px-space-lg rounded-xl shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 font-label-lg text-label-lg font-bold text-center"
                    >
                      <svg
                        className="w-6 h-6 fill-current shrink-0"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12.031 2C6.504 2 2.016 6.488 2.016 12.016c0 1.838.502 3.56 1.378 5.043L2 22l5.105-1.336A9.97 9.97 0 0 0 12.031 22C17.558 22 22.046 17.512 22.046 12.016 22.046 6.488 17.558 2 12.031 2zm5.727 14.156c-.238.67-1.182 1.282-1.637 1.328-.432.043-.997.199-3.232-.73-2.684-1.116-4.394-3.856-4.529-4.037-.134-.18-1.092-1.455-1.092-2.775 0-1.32.693-1.968.939-2.235.247-.267.538-.334.717-.334.18 0 .36.002.516.01.168.008.39-.064.61.464.226.541.77 1.874.836 2.01.068.135.112.293.022.473-.09.18-.135.293-.27.45-.134.158-.283.352-.405.473-.134.135-.274.281-.118.55.157.269.697 1.15 1.496 1.862 1.028.916 1.895 1.2 2.164 1.335.27.135.426.113.584-.068.157-.18.673-.788.852-1.057.18-.27.359-.225.597-.135.239.09 1.517.714 1.776.843.258.13.431.192.494.301.062.11.062.639-.176 1.309z" />
                      </svg>
                      <span>Hubungi via WhatsApp</span>
                    </a>

                    {showWaTooltip && (
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface font-label-md text-label-md px-3.5 py-1.5 rounded-lg shadow-xl z-20 pointer-events-none whitespace-nowrap flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-tertiary-fixed">
                          call
                        </span>
                        <span>WhatsApp Admin: +62 856-0898-1265</span>
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
                      <span>Lokasi Showroom</span>
                    </a>
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
                <div className="flex flex-col gap-space-sm">
                  <div>
                    <label className="block font-label-md text-label-md text-on-surface mb-1">
                      Nama Lengkap
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
                      Nomor WhatsApp
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
                        Tanggal
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
                        Waktu
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
                    disabled={isReserving}
                    onClick={() => setShowTestDriveModal(false)}
                    className="px-space-md py-2 text-primary font-label-md text-label-md hover:bg-surface-container rounded-lg cursor-pointer disabled:opacity-60"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={isReserving}
                    onClick={handleSubmitTestDrive}
                    className="px-space-md py-2 bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md rounded-lg shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-75"
                  >
                    {isReserving ? (
                      <>
                        <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin"></span>
                        <span>Menyiapkan WhatsApp...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[16px]">
                          send
                        </span>
                        <span>Konfirmasi via WA</span>
                      </>
                    )}
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
                <h2 className="font-headline-lg text-headline-lg text-primary font-bold">
                  Lokasi Showroom Kami
                </h2>
                <div className="flex items-center gap-space-sm text-on-surface-variant font-label-md text-label-md">
                  <span className="w-2.5 h-2.5 rounded-full bg-on-tertiary-container"></span>
                  <span>Buka Setiap Hari (08:30 - 18:00 WIB)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
                <div className="lg:col-span-8 overflow-hidden rounded-xl shadow-sm bg-surface-container-lowest flex flex-col border border-surface-container">
                  <div className="relative w-full h-72 md:h-80 bg-surface-container-low overflow-hidden">
                    <iframe
                      title="Lokasi Showroom Roda.Motorku di Google Maps"
                      src="https://maps.google.com/maps?q=Gondang%20Timur%2C%20Gondang%2C%20Kec.%20Pace%2C%20Kabupaten%20Nganjuk%2C%20Jawa%20Timur&t=&z=15&ie=UTF8&iwloc=&output=embed"
                      className="w-full h-full border-0"
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                  <div className="p-space-md flex flex-wrap items-center justify-between gap-space-sm bg-surface-container-lowest">
                    <div>
                      <p className="font-label-lg text-label-lg text-primary font-bold">
                        Roda.Motorku Showroom
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Gondang Timur, Gondang, Kec. Pace, Kabupaten Nganjuk,
                        Jawa Timur
                      </p>
                    </div>
                    <a
                      className="inline-flex items-center gap-1.5 bg-primary text-on-primary px-space-md py-2 rounded-lg font-label-md text-label-md hover:bg-primary-container transition-colors shadow-sm"
                      href="https://maps.google.com/?q=Gondang+Timur,+Gondang,+Kec.+Pace,+Kabupaten+Nganjuk,+Jawa+Timur"
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
                      Panduan Kunjungan
                    </h4>
                    <div className="flex flex-col gap-space-md">
                      <div className="flex items-start gap-space-sm">
                        <span className="w-6 h-6 rounded-full bg-secondary-container text-primary font-bold text-center text-[12px] flex items-center justify-center shrink-0">
                          1
                        </span>
                        <div>
                          <span className="font-label-md text-label-md text-on-surface font-bold">
                            Cek Fisik &amp; Dokumen
                          </span>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">
                            Cocokkan nomor rangka &amp; mesin langsung dengan
                            STNK dan BPKB asli.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-space-sm">
                        <span className="w-6 h-6 rounded-full bg-secondary-container text-primary font-bold text-center text-[12px] flex items-center justify-center shrink-0">
                          2
                        </span>
                        <div>
                          <span className="font-label-md text-label-md text-on-surface font-bold">
                            Test Drive di Tempat
                          </span>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">
                            Uji langsung kenyamanan berkendara bersama mekanik
                            kami.
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
                            Dilengkapi garansi mesin resmi showroom selama 1
                            bulan.
                          </p>
                        </div>
                      </div>
                    </div>
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

export default function DetailMotorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-surface">
          <div className="flex flex-col items-center gap-3">
            <span className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin"></span>
            <span className="font-label-md text-label-md text-on-surface-variant font-medium">
              Memuat detail motor...
            </span>
          </div>
        </div>
      }
    >
      <DetailMotorContent params={params} />
    </React.Suspense>
  );
}
