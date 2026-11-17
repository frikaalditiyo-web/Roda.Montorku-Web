"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useShowroom } from "@/context/ShowroomContext";
import {
  formatNumberID,
  formatRupiah,
  Motor,
  PrediksiHarga,
} from "@/data/mockShowroomData";

export default function RiwayatEstimasiPage() {
  const { predictions, deletePrediction, addMotor, linkPredictionToMotor, motors } =
    useShowroom();

  const [searchQuery, setSearchQuery] = useState("");
  const [modelFilter, setModelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPred, setSelectedPred] = useState<PrediksiHarga | null>(null);
  const [convertingPred, setConvertingPred] = useState<PrediksiHarga | null>(
    null
  );
  const [tipeBaru, setTipeBaru] = useState("Beat Deluxe");
  const [nopolBaru, setNopolBaru] = useState("B 6290 TKL");
  const [hargaAkhirBaru, setHargaAkhirBaru] = useState(14800000);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const filteredPredictions = useMemo(() => {
    return predictions.filter((p) => {
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        p.kode_prediksi.toLowerCase().includes(q) ||
        p.fitur_masukan.merek.toLowerCase().includes(q) ||
        (p.nama_motor_katalog || "").toLowerCase().includes(q) ||
        (p.nopol_katalog || "").toLowerCase().includes(q) ||
        p.nama_model.toLowerCase().includes(q);

      let matchModel = true;
      if (modelFilter === "rf") {
        matchModel = p.nama_model.includes("Random Forest");
      } else if (modelFilter === "lr") {
        matchModel = p.nama_model.includes("Linear Regression");
      } else if (modelFilter === "dt") {
        matchModel = p.nama_model.includes("Decision Tree");
      }

      let matchStatus = true;
      if (statusFilter === "catalog") {
        matchStatus = p.id_motor !== null;
      } else if (statusFilter === "unlinked") {
        matchStatus = p.id_motor === null;
      }

      return matchSearch && matchModel && matchStatus;
    });
  }, [predictions, searchQuery, modelFilter, statusFilter]);

  const totalPreds = predictions.length;
  const linkedCount = predictions.filter((p) => p.id_motor !== null).length;
  const avgR2 =
    totalPreds > 0
      ? (
          predictions.reduce((acc, p) => acc + p.akurasi_r2, 0) / totalPreds
        ).toFixed(1)
      : "92.8";

  const handleOpenConvertModal = (pred: PrediksiHarga) => {
    setConvertingPred(pred);
    setTipeBaru(
      pred.fitur_masukan.merek === "Vespa"
        ? "Sprint 150 I-Get ABS"
        : "Beat Deluxe"
    );
    setNopolBaru("B 6812 KLP");
    setHargaAkhirBaru(pred.harga_estimasi);
  };

  const handleConfirmConvert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertingPred) return;
    const f = convertingPred.fitur_masukan;
    const newMotor = addMotor({
      id_user: 1,
      sku: `RDK-${String(f.tahun).slice(-2)}-${f.merek
        .slice(0, 3)
        .toUpperCase()}-CVT`,
      nopol: nopolBaru,
      merek: (f.merek as Motor["merek"]) || "Honda",
      tipe: tipeBaru,
      tahun: f.tahun,
      cc: f.cc,
      kilometer: f.kilometer,
      kondisi_mesin: f.kondisi_mesin,
      kelengkapan_dokumen: f.kelengkapan_dokumen,
      domisili_samsat: f.domisili_samsat,
      pajak_info: "Pajak hidup s/d Oktober 2026",
      harga_beli: f.harga_beli,
      harga_jual: hargaAkhirBaru,
      harga_pasar_coret:
        Math.round((hargaAkhirBaru * 1.05) / 50000) * 50000,
      deskripsi: `Dikonversi dari riwayat estimasi ${convertingPred.kode_prediksi} (${convertingPred.nama_model}).`,
      status: "Tersedia",
      foto_motor: motors[0]?.foto_motor || [],
    });

    linkPredictionToMotor(convertingPred.id_prediksi, newMotor);
    setConvertingPred(null);
    triggerToast(
      `Riwayat ${convertingPred.kode_prediksi} berhasil dikonversi menjadi unit katalog (${newMotor.merek} ${newMotor.tipe})!`
    );
  };

  const handleExportCSV = () => {
    const headers = [
      "Kode Prediksi",
      "Waktu Estimasi",
      "Motor Terkait",
      "Merek",
      "Tahun",
      "CC",
      "Kilometer",
      "Kondisi Mesin",
      "Kelengkapan Dokumen",
      "Domisili Samsat",
      "Harga Beli",
      "Model ML",
      "R2 (%)",
      "Harga Estimasi",
    ];
    const rows = predictions.map((p) => [
      p.kode_prediksi,
      `"${p.created_at}"`,
      `"${p.nama_motor_katalog || "Belum Dikaitkan"}"`,
      p.fitur_masukan.merek,
      p.fitur_masukan.tahun,
      p.fitur_masukan.cc,
      p.fitur_masukan.kilometer,
      `"${p.fitur_masukan.kondisi_mesin}"`,
      `"${p.fitur_masukan.kelengkapan_dokumen}"`,
      `"${p.fitur_masukan.domisili_samsat}"`,
      p.fitur_masukan.harga_beli,
      `"${p.nama_model}"`,
      p.akurasi_r2,
      p.harga_estimasi,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "riwayat_prediksi_harga_rodamotorku.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("Berkas CSV riwayat estimasi berhasil diunduh.");
  };

  return (
    <div className="flex flex-col w-full">
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-space-md py-space-sm rounded-lg shadow-xl flex items-center gap-space-sm">
          <span className="material-symbols-outlined text-tertiary-fixed text-[20px]">
            check_circle
          </span>
          <span className="font-label-md text-label-md">{toastMsg}</span>
        </div>
      )}

      {/* Header Title & Metadata */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md mb-space-lg">
        <div className="flex flex-col max-w-3xl">
          <div className="flex items-center gap-space-xs mb-space-xs">
            <span className="px-space-xs py-0.5 rounded-DEFAULT bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold tracking-wide uppercase">
              Audit Log &amp; Valuasi
            </span>
            <span className="text-on-surface-variant font-label-sm text-label-sm">
              •
            </span>
            <span className="text-on-surface-variant font-label-sm text-label-sm font-mono">
              table: prediksi_harga
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">
            Riwayat Estimasi Harga
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Histori seluruh perhitungan prediksi harga pasar menggunakan model
            Machine Learning yang tersimpan di tabel database{" "}
            <code className="px-1.5 py-0.5 rounded-DEFAULT bg-surface-container-high text-primary font-mono text-body-sm font-semibold">
              prediksi_harga
            </code>
            .
          </p>
        </div>

        <div className="flex items-center gap-space-sm shrink-0">
          <div className="flex items-center gap-space-xs px-space-md py-space-xs rounded-DEFAULT bg-surface-container-lowest shadow-sm">
            <span className="material-symbols-outlined text-[18px] text-tertiary">
              memory
            </span>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant leading-tight">
                Engine Active
              </span>
              <span className="font-label-md text-label-md text-primary font-bold">
                Random Forest Regressor v1.4
              </span>
            </div>
          </div>
          <Link
            href="/admin/estimasi"
            className="inline-flex items-center gap-space-xs px-space-md py-2.5 rounded-DEFAULT bg-primary-container hover:bg-primary text-on-primary transition-all duration-150 shadow-sm font-label-md text-label-md font-semibold"
          >
            <span className="material-symbols-outlined text-[18px]">
              calculate
            </span>
            <span>Buat Prediksi Baru</span>
          </Link>
        </div>
      </div>

      {/* Metric Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md mb-space-lg">
        <div className="p-space-lg rounded-DEFAULT bg-secondary-container shadow-sm flex items-start justify-between relative overflow-hidden">
          <div className="flex flex-col z-10">
            <span className="font-label-md text-label-md text-on-secondary-container font-medium">
              Total Prediksi Dilakukan
            </span>
            <div className="flex items-baseline gap-space-xs mt-space-xs">
              <span className="font-display-lg text-display-lg font-bold text-primary tracking-tight tabular-nums">
                {totalPreds}
              </span>
              <span className="font-headline-sm text-headline-sm text-primary font-semibold">
                Rekaman
              </span>
            </div>
            <div className="flex items-center gap-1 mt-space-sm text-on-secondary-container font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[16px] text-tertiary">
                trending_up
              </span>
              <span className="font-semibold text-tertiary">Tersinkron</span>
              <span>dengan tabel prediksi_harga</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-DEFAULT bg-surface-container-lowest/80 flex items-center justify-center text-primary shadow-sm">
            <span className="material-symbols-outlined text-[26px]">
              insights
            </span>
          </div>
        </div>

        <div className="p-space-lg rounded-DEFAULT bg-secondary-container shadow-sm flex items-start justify-between relative overflow-hidden">
          <div className="flex flex-col z-10">
            <span className="font-label-md text-label-md text-on-secondary-container font-medium">
              Rata-rata Akurasi (R² Score)
            </span>
            <div className="flex items-baseline gap-space-xs mt-space-xs">
              <span className="font-display-lg text-display-lg font-bold text-primary tracking-tight tabular-nums">
                {avgR2}%
              </span>
              <span className="font-label-md text-label-md text-tertiary font-bold px-1.5 py-0.5 bg-tertiary-fixed rounded-DEFAULT">
                High Conf.
              </span>
            </div>
            <div className="flex items-center gap-1 mt-space-sm text-on-secondary-container font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[16px] text-primary">
                verified
              </span>
              <span>Evaluasi 3 Algoritma Regresi</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-DEFAULT bg-surface-container-lowest/80 flex items-center justify-center text-primary shadow-sm">
            <span className="material-symbols-outlined text-[26px]">
              model_training
            </span>
          </div>
        </div>

        <div className="p-space-lg rounded-DEFAULT bg-secondary-container shadow-sm flex items-start justify-between relative overflow-hidden">
          <div className="flex flex-col z-10">
            <span className="font-label-md text-label-md text-on-secondary-container font-medium">
              Unit Dikonversi ke Katalog
            </span>
            <div className="flex items-baseline gap-space-xs mt-space-xs">
              <span className="font-display-lg text-display-lg font-bold text-primary tracking-tight tabular-nums">
                {linkedCount}
              </span>
              <span className="font-headline-sm text-headline-sm text-primary font-semibold">
                Unit
              </span>
            </div>
            <div className="flex items-center gap-1 mt-space-sm text-on-secondary-container font-label-sm text-label-sm">
              <span className="w-2 h-2 rounded-full bg-tertiary"></span>
              <span>
                {totalPreds - linkedCount} unit lainnya berstatus simulasi tawar
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-DEFAULT bg-surface-container-lowest/80 flex items-center justify-center text-primary shadow-sm">
            <span className="material-symbols-outlined text-[26px]">
              published_with_changes
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Action Control Bar */}
      <div className="p-space-md rounded-DEFAULT bg-surface-container-lowest shadow-sm mb-space-md">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-md">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px] pointer-events-none">
              search
            </span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface-container-low text-on-surface placeholder:text-outline rounded-DEFAULT font-body-sm text-body-sm outline-none focus:bg-surface-container-lowest transition-colors"
              placeholder="Cari ID Prediksi (#PRD-...), merek motor, nomor plat, atau model ML..."
              type="text"
            />
          </div>

          <div className="flex flex-wrap items-center gap-space-sm shrink-0">
            <div className="relative">
              <select
                value={modelFilter}
                onChange={(e) => setModelFilter(e.target.value)}
                className="appearance-none bg-surface-container-low text-on-surface font-label-md text-label-md py-2 pl-3 pr-8 rounded-DEFAULT outline-none cursor-pointer"
              >
                <option value="all">Semua Model ML</option>
                <option value="rf">Random Forest Regressor v1.4</option>
                <option value="lr">Linear Regression</option>
                <option value="dt">Decision Tree Regressor</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline text-[16px] pointer-events-none">
                expand_more
              </span>
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-surface-container-low text-on-surface font-label-md text-label-md py-2 pl-3 pr-8 rounded-DEFAULT outline-none cursor-pointer"
              >
                <option value="all">Status: Semua Unit</option>
                <option value="catalog">Tersimpan di Katalog</option>
                <option value="unlinked">Belum Dikaitkan</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline text-[16px] pointer-events-none">
                expand_more
              </span>
            </div>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-space-xs px-space-md py-2 bg-surface-container-high hover:bg-surface-variant text-primary font-label-md text-label-md rounded-DEFAULT transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">
                download
              </span>
              <span>Ekspor CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Database Table Card */}
      <div className="rounded-DEFAULT bg-surface-container-lowest shadow-sm overflow-hidden flex flex-col">
        <div className="px-space-lg py-space-sm bg-surface-container-low flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <span className="font-label-md text-label-md text-on-surface-variant font-semibold uppercase tracking-wider">
              Log Inferensi Prediksi
            </span>
            <span className="px-2 py-0.5 rounded-DEFAULT bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-bold">
              {filteredPredictions.length} Rekaman
            </span>
          </div>
          <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm">
            <span className="material-symbols-outlined text-[16px] text-tertiary">
              autorenew
            </span>
            <span>Auto-sync aktif dengan database lokal</span>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container font-label-sm text-label-sm text-on-surface-variant tracking-wider uppercase">
                <th className="py-space-md px-space-md font-bold whitespace-nowrap">
                  ID Prediksi
                </th>
                <th className="py-space-md px-space-md font-bold whitespace-nowrap">
                  Waktu Estimasi
                </th>
                <th className="py-space-md px-space-md font-bold whitespace-nowrap">
                  Motor Terkait (Katalog)
                </th>
                <th className="py-space-md px-space-lg font-bold min-w-[340px]">
                  Ringkasan Fitur Masukan (8 Penentu Valuasi)
                </th>
                <th className="py-space-md px-space-md font-bold whitespace-nowrap">
                  Model ML &amp; Akurasi
                </th>
                <th className="py-space-md px-space-md font-bold whitespace-nowrap text-right">
                  Harga Estimasi (Rp)
                </th>
                <th className="py-space-md px-space-md font-bold whitespace-nowrap text-center">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container text-body-sm font-body-sm text-on-surface">
              {filteredPredictions.map((pred) => {
                const f = pred.fitur_masukan;
                const margin = pred.harga_estimasi - f.harga_beli;

                return (
                  <tr
                    key={pred.id_prediksi}
                    className="hover:bg-surface-container-low/70 transition-colors"
                  >
                    <td className="py-space-md px-space-md align-top">
                      <span className="inline-flex font-mono font-bold text-label-sm text-label-sm px-2 py-1 rounded-DEFAULT bg-secondary-container text-on-secondary-container">
                        {pred.kode_prediksi}
                      </span>
                    </td>

                    <td className="py-space-md px-space-md align-top whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-label-md text-label-md font-semibold text-on-surface">
                          {pred.created_at.split(",")[0]}
                        </span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant font-mono">
                          {pred.created_at.split(",")[1] || pred.waktu_relatif}
                        </span>
                      </div>
                    </td>

                    <td className="py-space-md px-space-md align-top">
                      {pred.id_motor !== null ? (
                        <div className="flex flex-col gap-1 max-w-[200px]">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                            <Link
                              href={`/katalog/${pred.id_motor}`}
                              className="font-label-md text-label-md font-bold text-primary hover:underline truncate"
                            >
                              {pred.nama_motor_katalog}
                            </Link>
                          </div>
                          <div className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant">
                            <span className="font-mono bg-surface-container px-1 py-0.5 rounded-DEFAULT text-on-surface">
                              {pred.nopol_katalog}
                            </span>
                            <span>[{pred.kode_motor_katalog}]</span>
                          </div>
                          <span className="inline-flex items-center w-fit px-1.5 py-0.5 rounded-DEFAULT bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-sm text-label-sm font-semibold mt-0.5">
                            <span className="material-symbols-outlined text-[13px] mr-1">
                              inventory_2
                            </span>
                            Di Katalog
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1 max-w-[200px]">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                            <span className="font-label-md text-label-md font-semibold text-secondary">
                              —
                            </span>
                          </div>
                          <span className="inline-flex items-center w-fit px-1.5 py-0.5 rounded-DEFAULT bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm font-semibold">
                            <span className="material-symbols-outlined text-[13px] mr-1">
                              link_off
                            </span>
                            Belum Dikaitkan
                          </span>
                          <span className="font-label-sm text-label-sm text-on-surface-variant italic">
                            {pred.catatan_simulasi || "Simulasi Tawar Lapangan"}
                          </span>
                        </div>
                      )}
                    </td>

                    <td className="py-space-md px-space-lg align-top">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 p-2 rounded-DEFAULT bg-surface-container-low">
                        <div className="flex flex-col">
                          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-tighter">
                            Merek &amp; Thn
                          </span>
                          <span className="font-label-md text-label-md font-semibold text-on-surface">
                            {f.merek}, {f.tahun}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-tighter">
                            CC &amp; Odo
                          </span>
                          <span className="font-label-md text-label-md font-semibold text-on-surface tabular-nums">
                            {f.cc} cc, {formatNumberID(f.kilometer)} km
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-tighter">
                            Kondisi Mesin
                          </span>
                          <span className="font-label-md text-label-md font-semibold text-tertiary">
                            {f.kondisi_mesin}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-tighter">
                            Kelengkapan
                          </span>
                          <span className="font-label-md text-label-md font-semibold text-on-surface truncate">
                            {f.kelengkapan_dokumen}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-tighter">
                            Samsat Plat
                          </span>
                          <span className="font-label-md text-label-md font-semibold text-on-surface truncate">
                            {f.domisili_samsat}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-tighter">
                            Modal Kulakan
                          </span>
                          <span className="font-label-md text-label-md font-semibold font-mono text-primary tabular-nums">
                            {formatRupiah(f.harga_beli)}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-space-md px-space-md align-top whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className="font-label-md text-label-md font-bold text-primary">
                          {pred.nama_model}
                        </span>
                        <div className="inline-flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
                          <span className="material-symbols-outlined text-tertiary text-[15px]">
                            verified
                          </span>
                          <span>
                            R² Score:{" "}
                            <strong className="text-tertiary font-bold">
                              {pred.akurasi_r2}%
                            </strong>
                          </span>
                        </div>
                        <span className="font-body-sm text-body-sm text-on-surface-variant font-mono">
                          {pred.detail_parameter_model}
                        </span>
                      </div>
                    </td>

                    <td className="py-space-md px-space-md align-top text-right whitespace-nowrap">
                      <div className="flex flex-col items-end">
                        <span className="font-currency-stat text-currency-stat font-bold text-primary tabular-nums">
                          {formatRupiah(pred.harga_estimasi)}
                        </span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant mt-0.5 tabular-nums">
                          MAE: ± {formatRupiah(pred.spread_estimasi)}
                        </span>
                        <span className="font-label-sm text-label-sm font-semibold text-tertiary mt-0.5 bg-tertiary-fixed px-1.5 py-0.5 rounded-DEFAULT tabular-nums">
                          Margin Est: +
                          {formatRupiah(Math.max(0, margin))}
                        </span>
                      </div>
                    </td>

                    <td className="py-space-md px-space-md align-top text-center whitespace-nowrap">
                      <div className="flex flex-col items-center gap-1">
                        {pred.id_motor === null && (
                          <button
                            onClick={() => handleOpenConvertModal(pred)}
                            className="w-full inline-flex items-center justify-center gap-1 px-2 py-1 rounded-DEFAULT bg-primary-container hover:bg-primary text-on-primary font-label-sm text-label-sm font-semibold transition-colors cursor-pointer"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              add_circle
                            </span>
                            <span>Pakai ke Katalog</span>
                          </button>
                        )}
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedPred(pred)}
                            className="p-1.5 text-primary hover:bg-secondary-container rounded-DEFAULT transition-colors cursor-pointer"
                            title="Lihat Detail Parameter Prediksi"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              visibility
                            </span>
                          </button>
                          <button
                            onClick={() => window.print()}
                            className="p-1.5 text-on-surface-variant hover:bg-surface-container rounded-DEFAULT transition-colors cursor-pointer"
                            title="Cetak Kartu Estimasi"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              print
                            </span>
                          </button>
                          <button
                            onClick={() => {
                              deletePrediction(pred.id_prediksi);
                              triggerToast(
                                `Riwayat ${pred.kode_prediksi} dihapus.`
                              );
                            }}
                            className="p-1.5 text-error hover:bg-error-container rounded-DEFAULT transition-colors cursor-pointer"
                            title="Hapus Riwayat"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              delete
                            </span>
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-space-lg py-space-md bg-surface-container-lowest flex flex-col sm:flex-row items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-xs font-body-sm text-body-sm text-on-surface-variant">
            <span>Menampilkan</span>
            <span className="font-semibold text-on-surface">
              {filteredPredictions.length}
            </span>
            <span>dari</span>
            <span className="font-semibold text-on-surface font-mono">
              {totalPreds}
            </span>
            <span>riwayat estimasi harga machine learning</span>
          </div>
        </div>
      </div>

      {/* Operational Context Note */}
      <div className="mt-space-lg p-space-md rounded-DEFAULT bg-surface-container-low flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
        <div className="flex items-start gap-space-sm">
          <span className="material-symbols-outlined text-primary text-[22px] shrink-0 mt-0.5">
            info
          </span>
          <div className="flex flex-col">
            <span className="font-label-md text-label-md text-primary font-bold">
              Integritas Data Relasional PostgreSQL (`prediksi_harga`)
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Entri dengan kolom{" "}
              <code className="font-mono text-primary font-semibold">
                id_motor: NULL
              </code>{" "}
              merepresentasikan simulasi tawar tunai lapangan. Tombol{" "}
              <em>&ldquo;Pakai ke Katalog&rdquo;</em> akan memicu penambahan
              motor baru dengan pra-isian nilai valuasi otomatis.
            </span>
          </div>
        </div>
      </div>

      {/* Modal Detail Parameter Prediksi */}
      {selectedPred && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-xl p-space-lg shadow-2xl flex flex-col gap-space-md">
            <div className="flex items-center justify-between border-b border-surface-container pb-space-sm">
              <div>
                <span className="font-mono font-bold text-label-sm text-primary">
                  {selectedPred.kode_prediksi}
                </span>
                <h3 className="font-headline-sm text-headline-sm text-primary font-bold">
                  Detail Payload JSON `fitur_masukan`
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPred(null)}
                className="text-on-surface-variant hover:text-primary cursor-pointer"
              >
                <span className="material-symbols-outlined text-[22px]">
                  close
                </span>
              </button>
            </div>

            <pre className="bg-surface-container-low p-space-md rounded-lg font-mono text-body-sm overflow-x-auto text-on-surface">
              {JSON.stringify(
                {
                  id_prediksi: selectedPred.id_prediksi,
                  id_motor: selectedPred.id_motor,
                  nama_model: selectedPred.nama_model,
                  harga_estimasi: selectedPred.harga_estimasi,
                  fitur_masukan: selectedPred.fitur_masukan,
                  created_at: selectedPred.created_at,
                },
                null,
                2
              )}
            </pre>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedPred(null)}
                className="px-space-md py-2 bg-primary text-on-primary rounded-lg font-label-md text-label-md cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konversi Simulasi ke Katalog ("Pakai ke Katalog") */}
      {convertingPred && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <form
            onSubmit={handleConfirmConvert}
            className="bg-surface-container-lowest w-full max-w-lg rounded-xl p-space-lg shadow-2xl flex flex-col gap-space-md"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm text-headline-sm text-primary font-bold">
                Konversi {convertingPred.kode_prediksi} ke Katalog Motor
              </h3>
              <button
                type="button"
                onClick={() => setConvertingPred(null)}
                className="text-on-surface-variant hover:text-primary cursor-pointer"
              >
                <span className="material-symbols-outlined text-[22px]">
                  close
                </span>
              </button>
            </div>

            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Lengkapi tipe varian dan nomor polisi untuk menayangkan unit{" "}
              <strong>
                {convertingPred.fitur_masukan.merek} (
                {convertingPred.fitur_masukan.tahun})
              </strong>{" "}
              ke halaman Katalog Publik.
            </p>

            <div className="flex flex-col gap-space-sm">
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1">
                  Tipe / Varian Motor
                </label>
                <input
                  value={tipeBaru}
                  onChange={(e) => setTipeBaru(e.target.value)}
                  className="w-full bg-surface-container-low px-3 py-2 rounded-lg text-body-md text-on-surface"
                  required
                  type="text"
                />
              </div>
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1">
                  Nomor Polisi (Plat)
                </label>
                <input
                  value={nopolBaru}
                  onChange={(e) => setNopolBaru(e.target.value.toUpperCase())}
                  className="w-full bg-surface-container-low px-3 py-2 rounded-lg font-mono font-bold text-body-md text-on-surface uppercase"
                  required
                  type="text"
                />
              </div>
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1">
                  Harga Jual Akhir (Rp)
                </label>
                <input
                  value={hargaAkhirBaru}
                  onChange={(e) =>
                    setHargaAkhirBaru(parseInt(e.target.value, 10) || 0)
                  }
                  className="w-full bg-surface-container-low px-3 py-2 rounded-lg font-mono font-bold text-primary text-body-md"
                  required
                  type="number"
                />
              </div>
            </div>

            <div className="flex justify-end gap-space-sm pt-space-xs">
              <button
                type="button"
                onClick={() => setConvertingPred(null)}
                className="px-space-md py-2 text-secondary font-label-md text-label-md hover:bg-surface-container rounded-lg cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-space-md py-2 bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-bold rounded-lg shadow-md cursor-pointer"
              >
                Simpan ke Katalog
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
