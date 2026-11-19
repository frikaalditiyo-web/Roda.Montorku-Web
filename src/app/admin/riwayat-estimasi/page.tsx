"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useShowroom } from "@/context/ShowroomContext";
import { CountUpNumber } from "@/components/CountUpNumber";
import {
  formatNumberID,
  formatRupiah,
  Motor,
  PrediksiHarga,
} from "@/data/mockShowroomData";

export default function RiwayatEstimasiPage() {
  const {
    predictions,
    deletePrediction,
    updatePrediction,
    addMotor,
    linkPredictionToMotor,
    motors,
  } = useShowroom();

  const [searchQuery, setSearchQuery] = useState("");
  const [modelFilter, setModelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ROWS_PER_PAGE = 10;
  const [selectedPred, setSelectedPred] = useState<PrediksiHarga | null>(null);
  const [convertingPred, setConvertingPred] = useState<PrediksiHarga | null>(
    null
  );
  const [tipeBaru, setTipeBaru] = useState("Beat Deluxe");
  const [nopolBaru, setNopolBaru] = useState("B 6290 TKL");
  const [hargaAkhirBaru, setHargaAkhirBaru] = useState(14800000);
  const [isConverting, setIsConverting] = useState(false);
  const [convertSuccess, setConvertSuccess] = useState(false);

  // Warning & Confirmation States for Delete and Edit
  const [deletingPred, setDeletingPred] = useState<PrediksiHarga | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [editingPred, setEditingPred] = useState<PrediksiHarga | null>(null);
  const [editPriceInput, setEditPriceInput] = useState<number>(0);
  const [editNoteInput, setEditNoteInput] = useState<string>("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);

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

  const totalPages = Math.ceil(filteredPredictions.length / ROWS_PER_PAGE);
  const pageStart = (currentPage - 1) * ROWS_PER_PAGE;
  const paginatedPredictions = filteredPredictions.slice(
    pageStart,
    pageStart + ROWS_PER_PAGE
  );
  const pageBlockStart = Math.floor((currentPage - 1) / 10) * 10 + 1;
  const pageBlockEnd = Math.min(pageBlockStart + 9, totalPages);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, modelFilter, statusFilter]);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

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

    setIsConverting(true);
    const targetPred = convertingPred;

    setTimeout(() => {
      const f = targetPred.fitur_masukan;
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
        deskripsi: `Dikonversi dari riwayat estimasi ${targetPred.kode_prediksi} (${targetPred.nama_model}).`,
        status: "Tersedia",
        foto_motor: motors[0]?.foto_motor || [],
      });

      linkPredictionToMotor(targetPred.id_prediksi, newMotor);
      setIsConverting(false);
      setConvertSuccess(true);

      setTimeout(() => {
        setConvertSuccess(false);
        setConvertingPred(null);
        triggerToast(
          `Riwayat ${targetPred.kode_prediksi} berhasil dikonversi menjadi unit katalog (${newMotor.merek} ${newMotor.tipe})!`
        );
      }, 700);
    }, 450);
  };

  const handleConfirmDelete = () => {
    if (!deletingPred) return;
    setIsDeleting(true);
    setTimeout(() => {
      deletePrediction(deletingPred.id_prediksi);
      triggerToast(`Riwayat estimasi ${deletingPred.kode_prediksi} berhasil dihapus.`);
      setIsDeleting(false);
      setDeletingPred(null);
    }, 400);
  };

  const handleOpenEditModal = (pred: PrediksiHarga) => {
    setEditingPred(pred);
    setEditPriceInput(pred.harga_estimasi);
    setEditNoteInput(pred.catatan_simulasi || "");
  };

  const handleConfirmEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPred) return;

    setIsSavingEdit(true);
    setTimeout(() => {
      updatePrediction(editingPred.id_prediksi, {
        harga_estimasi: editPriceInput,
        catatan_simulasi: editNoteInput,
      });
      setIsSavingEdit(false);
      setEditSuccess(true);

      setTimeout(() => {
        setEditSuccess(false);
        setEditingPred(null);
        triggerToast(
          `Estimasi ${editingPred.kode_prediksi} berhasil diperbarui menjadi ${formatRupiah(editPriceInput)}.`
        );
      }, 700);
    }, 450);
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
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">
            Riwayat Estimasi Harga
          </h1>
        </div>

        <div className="flex items-center gap-space-sm shrink-0">
          <Link
            href="/admin/estimasi"
            className="inline-flex items-center px-space-md py-2.5 rounded-DEFAULT bg-primary-container hover:bg-primary text-on-primary transition-all duration-150 shadow-sm font-label-md text-label-md font-semibold"
          >
            <span>Buat Prediksi Baru</span>
          </Link>
        </div>
      </div>

      {/* Metric Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md mb-space-lg">
        <div className="p-space-lg rounded-xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm flex items-center justify-between relative overflow-hidden">
          <div className="flex flex-col z-10">
            <span className="font-label-md text-label-md text-on-surface-variant font-medium">
              Total Prediksi
            </span>
            <div className="flex items-baseline gap-space-xs mt-space-xs">
              <span className="font-display-lg text-display-lg font-bold text-primary tracking-tight tabular-nums">
                <CountUpNumber value={totalPreds} />
              </span>
              <span className="font-label-md text-label-md text-on-surface-variant">
                rekaman
              </span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-DEFAULT bg-surface-container flex items-center justify-center text-primary shadow-xs">
            <span className="material-symbols-outlined text-[24px]">
              insights
            </span>
          </div>
        </div>

        <div className="p-space-lg rounded-xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm flex items-center justify-between relative overflow-hidden">
          <div className="flex flex-col z-10">
            <span className="font-label-md text-label-md text-on-surface-variant font-medium">
              Rata-rata Akurasi (R²)
            </span>
            <div className="flex items-baseline gap-space-xs mt-space-xs">
              <span className="font-display-lg text-display-lg font-bold text-primary tracking-tight tabular-nums">
                <CountUpNumber value={Number(avgR2)} decimals={1} suffix="%" />
              </span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-DEFAULT bg-surface-container flex items-center justify-center text-primary shadow-xs">
            <span className="material-symbols-outlined text-[24px]">
              model_training
            </span>
          </div>
        </div>

        <div className="p-space-lg rounded-xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm flex items-center justify-between relative overflow-hidden">
          <div className="flex flex-col z-10">
            <span className="font-label-md text-label-md text-on-surface-variant font-medium">
              Tersimpan di Katalog
            </span>
            <div className="flex items-baseline gap-space-xs mt-space-xs">
              <span className="font-display-lg text-display-lg font-bold text-primary tracking-tight tabular-nums">
                <CountUpNumber value={linkedCount} />
              </span>
              <span className="font-label-md text-label-md text-on-surface-variant">
                unit
              </span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-DEFAULT bg-surface-container flex items-center justify-center text-primary shadow-xs">
            <span className="material-symbols-outlined text-[24px]">
              published_with_changes
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Action Control Bar */}
      <div className="p-space-md rounded-xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm mb-space-md">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-md">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px] pointer-events-none">
              search
            </span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface-container-low text-on-surface placeholder:text-outline rounded-DEFAULT font-body-sm text-body-sm outline-none focus:bg-surface-container-lowest transition-colors"
              placeholder="Cari ID Prediksi, merek motor, atau model ML..."
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
                <option value="all">Semua Model</option>
                <option value="rf">Random Forest</option>
                <option value="lr">Linear Regression</option>
                <option value="dt">Decision Tree</option>
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
                <option value="all">Semua Status</option>
                <option value="catalog">Di Katalog</option>
                <option value="unlinked">Simulasi</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline text-[16px] pointer-events-none">
                expand_more
              </span>
            </div>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center px-space-md py-2 bg-surface-container-high hover:bg-surface-variant text-primary font-label-md text-label-md rounded-DEFAULT transition-colors cursor-pointer"
              type="button"
            >
              <span>Ekspor CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Database Table Card */}
      <div className="rounded-xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm overflow-hidden flex flex-col">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-primary text-on-primary text-[12px] tracking-wider uppercase">
                <th className="py-3 px-space-md font-semibold whitespace-nowrap">
                  ID
                </th>
                <th className="py-3 px-space-md font-semibold whitespace-nowrap">
                  Tanggal
                </th>
                <th className="py-3 px-space-md font-semibold whitespace-nowrap">
                  Unit Katalog
                </th>
                <th className="py-3 px-space-md font-semibold min-w-[260px]">
                  Spesifikasi Masukan
                </th>
                <th className="py-3 px-space-md font-semibold whitespace-nowrap">
                  Model ML
                </th>
                <th className="py-3 px-space-md font-semibold whitespace-nowrap text-right">
                  Harga Estimasi
                </th>
                <th className="py-3 px-space-md font-semibold whitespace-nowrap text-center">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container text-[13px] text-on-surface bg-surface-container-lowest">
              {paginatedPredictions.map((pred) => {
                const f = pred.fitur_masukan;
                const margin = pred.harga_estimasi - f.harga_beli;

                return (
                  <tr
                    key={pred.id_prediksi}
                    className="hover:bg-surface-container-low/70 transition-colors"
                  >
                    <td className="py-2.5 px-space-md align-middle">
                      <span className="inline-flex font-mono font-semibold text-[11px] px-2 py-0.5 rounded-DEFAULT bg-secondary-container text-on-secondary-container">
                        {pred.kode_prediksi}
                      </span>
                    </td>

                    <td className="py-2.5 px-space-md align-middle whitespace-nowrap">
                      <span className="text-[13px] text-on-surface">
                        {pred.created_at.split(",")[0]}
                      </span>
                    </td>

                    <td className="py-2.5 px-space-md align-middle">
                      {pred.id_motor !== null ? (
                        <div className="flex flex-col gap-0.5">
                          <Link
                            href={`/katalog/${pred.id_motor}`}
                            className="text-[13px] font-semibold text-primary hover:underline truncate"
                          >
                            {pred.nama_motor_katalog}
                          </Link>
                          <span className="text-[11px] text-on-surface-variant">
                            {pred.nopol_katalog}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-DEFAULT bg-surface-container text-on-surface-variant text-[11px]">
                          Simulasi
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-space-md align-middle">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[13px] font-semibold text-on-surface">
                          {f.merek} ({f.tahun}) • {f.cc} cc •{" "}
                          {formatNumberID(f.kilometer)} km
                        </span>
                        <span className="text-[11px] text-on-surface-variant">
                          {f.kondisi_mesin} • {f.domisili_samsat} • Modal{" "}
                          {formatRupiah(f.harga_beli)}
                        </span>
                      </div>
                    </td>

                    <td className="py-2.5 px-space-md align-middle whitespace-nowrap">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[13px] font-semibold text-primary">
                          {pred.nama_model.replace(" Regressor v1.4", "")}
                        </span>
                        <span className="text-[11px] text-tertiary font-semibold">
                          R² {pred.akurasi_r2}%
                        </span>
                      </div>
                    </td>

                    <td className="py-2.5 px-space-md align-middle text-right whitespace-nowrap">
                      <div className="flex flex-col items-end">
                        <span className="text-[13px] font-bold text-primary tabular-nums">
                          {formatRupiah(pred.harga_estimasi)}
                        </span>
                        <span className="text-[11px] text-tertiary tabular-nums">
                          +{formatRupiah(Math.max(0, margin))}
                        </span>
                      </div>
                    </td>

                    <td className="py-2.5 px-space-md align-middle text-center whitespace-nowrap">
                      <div className="inline-flex items-center justify-center gap-1">
                        {pred.id_motor === null && (
                          <button
                            onClick={() => handleOpenConvertModal(pred)}
                            className="inline-flex items-center px-2 py-1 rounded-DEFAULT bg-primary-container hover:bg-primary text-on-primary text-[11px] font-semibold transition-colors cursor-pointer mr-1"
                            type="button"
                          >
                            <span>Simpan</span>
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedPred(pred)}
                          className="p-1 text-primary hover:bg-secondary-container rounded-DEFAULT transition-colors cursor-pointer"
                          title="Lihat Detail"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-primary text-[18px]">
                            visibility
                          </span>
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(pred)}
                          className="p-1 text-primary hover:bg-secondary-container rounded-DEFAULT transition-colors cursor-pointer"
                          title="Ubah Nilai & Catatan"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            edit
                          </span>
                        </button>
                        <button
                          onClick={() => window.print()}
                          className="p-1 text-on-surface-variant hover:bg-surface-container rounded-DEFAULT transition-colors cursor-pointer"
                          title="Cetak"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            print
                          </span>
                        </button>
                        <button
                          onClick={() => setDeletingPred(pred)}
                          className="p-1 text-error hover:bg-error-container rounded-DEFAULT transition-colors cursor-pointer"
                          title="Hapus"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            delete
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-space-lg py-2.5 bg-surface-container-low/50 flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm text-[12px] text-on-surface-variant">
          <span>
            Menampilkan{" "}
            <strong className="font-semibold text-on-surface">
              {filteredPredictions.length === 0 ? 0 : pageStart + 1}
            </strong>{" "}
            –{" "}
            <strong className="font-semibold text-on-surface">
              {Math.min(pageStart + ROWS_PER_PAGE, filteredPredictions.length)}
            </strong>{" "}
            dari{" "}
            <strong className="font-semibold text-on-surface">
              {filteredPredictions.length}
            </strong>{" "}
            riwayat
          </span>
          {totalPages > 1 && (
            <nav aria-label="Navigasi halaman riwayat estimasi" className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, pageBlockStart - 1))}
                disabled={pageBlockStart === 1}
                className="px-2.5 py-1.5 rounded-DEFAULT bg-surface-container-lowest text-primary font-semibold hover:bg-primary-container hover:text-on-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Prev
              </button>
              {Array.from(
                { length: Math.max(0, pageBlockEnd - pageBlockStart + 1) },
                (_, index) => pageBlockStart + index
              ).map((page) => (
                <button
                  key={page}
                  type="button"
                  aria-current={currentPage === page ? "page" : undefined}
                  onClick={() => setCurrentPage(page)}
                  className={`min-w-8 px-2.5 py-1.5 rounded-DEFAULT font-semibold transition-colors ${
                    currentPage === page
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-lowest text-primary hover:bg-primary-container hover:text-on-primary"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, pageBlockEnd + 1))}
                disabled={pageBlockEnd === totalPages}
                className="px-2.5 py-1.5 rounded-DEFAULT bg-surface-container-lowest text-primary font-semibold hover:bg-primary-container hover:text-on-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </nav>
          )}
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
                  Detail Prediksi Harga
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

            <div className="grid grid-cols-2 gap-3 bg-surface-container-low p-space-md rounded-lg text-body-sm">
              <div>
                <span className="text-on-surface-variant block text-label-sm">
                  Merek &amp; Tahun
                </span>
                <span className="font-semibold text-on-surface">
                  {selectedPred.fitur_masukan.merek} (
                  {selectedPred.fitur_masukan.tahun})
                </span>
              </div>
              <div>
                <span className="text-on-surface-variant block text-label-sm">
                  Mesin &amp; Odometer
                </span>
                <span className="font-semibold text-on-surface">
                  {selectedPred.fitur_masukan.cc} cc •{" "}
                  {formatNumberID(selectedPred.fitur_masukan.kilometer)} km
                </span>
              </div>
              <div>
                <span className="text-on-surface-variant block text-label-sm">
                  Kondisi Mesin
                </span>
                <span className="font-semibold text-on-surface">
                  {selectedPred.fitur_masukan.kondisi_mesin}
                </span>
              </div>
              <div>
                <span className="text-on-surface-variant block text-label-sm">
                  Kelengkapan
                </span>
                <span className="font-semibold text-on-surface">
                  {selectedPred.fitur_masukan.kelengkapan_dokumen}
                </span>
              </div>
              <div>
                <span className="text-on-surface-variant block text-label-sm">
                  Domisili Samsat
                </span>
                <span className="font-semibold text-on-surface">
                  {selectedPred.fitur_masukan.domisili_samsat}
                </span>
              </div>
              <div>
                <span className="text-on-surface-variant block text-label-sm">
                  Harga Beli
                </span>
                <span className="font-semibold text-on-surface">
                  {formatRupiah(selectedPred.fitur_masukan.harga_beli)}
                </span>
              </div>
              <div className="col-span-2 pt-2 border-t border-outline-variant/30 flex items-center justify-between">
                <span className="text-on-surface-variant text-label-md">
                  Hasil Estimasi ({selectedPred.nama_model})
                </span>
                <span className="font-bold text-primary text-label-lg">
                  {formatRupiah(selectedPred.harga_estimasi)}
                </span>
              </div>
            </div>

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

      {/* Modal Konversi Simulasi ke Katalog */}
      {convertingPred && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <form
            onSubmit={handleConfirmConvert}
            className="relative bg-surface-container-lowest w-full max-w-lg rounded-xl p-space-lg shadow-2xl flex flex-col gap-space-md overflow-hidden"
          >
            {/* Converting & Success Overlay */}
            {isConverting && (
              <div className="absolute inset-0 z-50 bg-surface/85 backdrop-blur-xs flex flex-col items-center justify-center gap-3 animate-in fade-in">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                  <span className="material-symbols-outlined text-primary text-[24px]">
                    published_with_changes
                  </span>
                </div>
                <div className="text-center">
                  <h3 className="font-headline-sm text-headline-sm font-bold text-primary">
                    Mengonversi ke Katalog...
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Mendaftarkan unit motor dari histori simulasi...
                  </p>
                </div>
              </div>
            )}

            {convertSuccess && (
              <div className="absolute inset-0 z-50 bg-surface/90 backdrop-blur-xs flex flex-col items-center justify-center gap-3 animate-in zoom-in-95">
                <div className="w-16 h-16 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-xl animate-in zoom-in-50">
                  <span
                    className="material-symbols-outlined text-[36px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                </div>
                <div className="text-center">
                  <h3 className="font-headline-sm text-headline-sm font-bold text-primary">
                    Berhasil Dikonversi!
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Unit telah aktif di inventaris showroom.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm text-headline-sm text-primary font-bold">
                Tambahkan ke Katalog Motor
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

            <div className="flex flex-col gap-space-sm">
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1">
                  Tipe / Varian Motor ({convertingPred.fitur_masukan.merek})
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
                  Nomor Polisi
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
                disabled={isConverting || convertSuccess}
                onClick={() => setConvertingPred(null)}
                className="px-space-md py-2 text-primary font-label-md text-label-md hover:bg-surface-container rounded-lg cursor-pointer disabled:opacity-60"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isConverting || convertSuccess}
                className="px-space-md py-2 bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-bold rounded-lg shadow-md cursor-pointer flex items-center gap-1.5 disabled:opacity-75"
              >
                {isConverting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin"></span>
                    <span>Mengonversi...</span>
                  </>
                ) : (
                  <span>Simpan ke Katalog</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Estimation Warning Modal */}
      {deletingPred && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-200 animate-in fade-in">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-2xl p-6 max-w-sm w-full flex flex-col gap-4 text-left animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-error/15 text-error flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">
                  delete
                </span>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm font-bold text-primary tracking-tight">
                  Hapus Riwayat Estimasi
                </h3>
                <span className="font-mono text-[12px] text-on-surface-variant font-semibold">
                  {deletingPred.kode_prediksi}
                </span>
              </div>
            </div>

            <p className="font-body-md text-body-md text-on-surface-variant">
              Apakah Anda yakin ingin menghapus data estimasi untuk{" "}
              <strong className="text-primary">
                {deletingPred.fitur_masukan.merek} ({deletingPred.fitur_masukan.tahun})
              </strong>{" "}
              dengan valuasi {formatRupiah(deletingPred.harga_estimasi)}? Data histori ini akan dihapus permanen.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-outline-variant/30">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingPred(null)}
                className="px-4 py-2 rounded-xl text-primary font-label-md text-label-md font-semibold bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer disabled:opacity-60"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-error hover:bg-error/90 text-on-error font-label-md text-label-md font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer disabled:opacity-60"
              >
                {isDeleting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-on-error/30 border-t-on-error rounded-full animate-spin"></span>
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">
                      delete
                    </span>
                    <span>Ya, Hapus</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Estimation Warning & Adjustment Modal */}
      {editingPred && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in">
          <form
            onSubmit={handleConfirmEdit}
            className="relative bg-surface-container-lowest w-full max-w-lg rounded-2xl border border-outline-variant/60 shadow-2xl p-space-lg flex flex-col gap-space-md overflow-hidden animate-in zoom-in-95"
          >
            {/* Feedback Overlay */}
            {isSavingEdit && (
              <div className="absolute inset-0 z-50 bg-surface/85 backdrop-blur-xs flex flex-col items-center justify-center gap-3 animate-in fade-in">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                  <span className="material-symbols-outlined text-primary text-[24px]">
                    edit
                  </span>
                </div>
                <div className="text-center">
                  <h3 className="font-headline-sm text-headline-sm font-bold text-primary">
                    Menyimpan Perubahan Estimasi...
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Memperbarui histori valuasi showroom...
                  </p>
                </div>
              </div>
            )}

            {editSuccess && (
              <div className="absolute inset-0 z-50 bg-surface/90 backdrop-blur-xs flex flex-col items-center justify-center gap-3 animate-in zoom-in-95">
                <div className="w-16 h-16 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-xl animate-in zoom-in-50">
                  <span
                    className="material-symbols-outlined text-[36px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                </div>
                <div className="text-center">
                  <h3 className="font-headline-sm text-headline-sm font-bold text-primary">
                    Perubahan Berhasil Disimpan!
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Nilai dan catatan estimasi telah diperbarui.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between border-b border-surface-container pb-space-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-[20px]">
                    edit
                  </span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-primary font-bold">
                    Ubah Data Estimasi
                  </h3>
                  <span className="font-mono text-[11px] text-on-surface-variant font-semibold">
                    {editingPred.kode_prediksi}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingPred(null)}
                className="text-on-surface-variant hover:text-primary cursor-pointer p-1 rounded-lg hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">
                  close
                </span>
              </button>
            </div>

            {/* Warning Alert Banner */}
            <div className="p-3 bg-secondary-container/60 rounded-xl border border-primary/20 flex items-start gap-2.5">
              <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">
                warning
              </span>
              <p className="font-body-sm text-[12px] text-on-secondary-container leading-relaxed">
                <strong>Peringatan:</strong> Mengubah nilai atau catatan estimasi ini akan memperbarui histori valuasi model ML ({editingPred.nama_model}). Pastikan angka penyesuaian telah ditinjau.
              </p>
            </div>

            <div className="flex flex-col gap-space-sm">
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1 font-semibold">
                  Unit Motor &amp; Spesifikasi
                </label>
                <div className="p-2.5 bg-surface-container-low rounded-lg text-body-sm text-on-surface flex items-center justify-between">
                  <span>
                    {editingPred.fitur_masukan.merek} ({editingPred.fitur_masukan.tahun}) • {editingPred.fitur_masukan.cc} cc
                  </span>
                  <span className="font-semibold text-primary">
                    Modal: {formatRupiah(editingPred.fitur_masukan.harga_beli)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1 font-semibold">
                  Nilai Estimasi / Penyesuaian Harga Jual (Rp)
                </label>
                <input
                  value={editPriceInput}
                  onChange={(e) =>
                    setEditPriceInput(parseInt(e.target.value, 10) || 0)
                  }
                  className="w-full bg-surface-container-low px-3 py-2 rounded-lg font-mono font-bold text-primary text-body-md focus:outline-none focus:ring-2 focus:ring-primary border border-outline-variant/50"
                  required
                  type="number"
                />
              </div>

              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1 font-semibold">
                  Catatan Simulasi / Keterangan Penyesuaian
                </label>
                <textarea
                  rows={3}
                  value={editNoteInput}
                  onChange={(e) => setEditNoteInput(e.target.value)}
                  className="w-full bg-surface-container-low px-3 py-2 rounded-lg text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary border border-outline-variant/50 resize-none"
                  placeholder="Contoh: Disesuaikan dengan kenaikan pajak samsat atau perbaikan ban..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-space-sm pt-space-xs border-t border-outline-variant/30">
              <button
                type="button"
                disabled={isSavingEdit || editSuccess}
                onClick={() => setEditingPred(null)}
                className="px-space-md py-2 text-primary font-label-md text-label-md hover:bg-surface-container rounded-xl cursor-pointer disabled:opacity-60"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSavingEdit || editSuccess}
                className="px-space-md py-2 bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-75"
              >
                {isSavingEdit ? (
                  <>
                    <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin"></span>
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">
                      check_circle
                    </span>
                    <span>Simpan Perubahan</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
