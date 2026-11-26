"use client";

import React, { Suspense, useState, useMemo, useRef, useEffect } from "react";
import { CountUpNumber } from "@/components/CountUpNumber";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useShowroom } from "@/context/ShowroomContext";
import {
  calculateMLPrediction,
  DATASET_DOKUMEN_OPTIONS,
  DATASET_KONDISI_OPTIONS,
  DATASET_SAMSAT_OPTIONS,
  formatNumberID,
  formatRupiah,
  FotoMotor,
  Motor,
} from "@/data/mockShowroomData";

function KelolaDataMotorContent() {
  const { motors, addMotor, updateMotor, deleteMotor, refreshData } = useShowroom();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("terbaru");
  const [yearFilter, setYearFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ROWS_PER_PAGE = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMotorId, setEditingMotorId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Transitions & Loading States
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [deletingMotor, setDeletingMotor] = useState<Motor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal Form State (Tabel `motor` & `foto_motor`)
  const [merek, setMerek] = useState<Motor["merek"]>("Honda");
  const [tipe, setTipe] = useState("Vario 160 CBS");
  const [nopol, setNopol] = useState("AG 4819 KOX");
  const [tahun, setTahun] = useState(2023);
  const [cc, setCc] = useState(160);
  const [kilometer, setKilometer] = useState(12450);
  const [domisiliSamsat, setDomisiliSamsat] = useState("Nganjuk (AG)");
  const [kondisiMesin, setKondisiMesin] = useState("Sangat Baik");
  const [kelengkapanDokumen, setKelengkapanDokumen] = useState(
    "Lengkap (STNK + BPKB)"
  );
  const [hargaBeli, setHargaBeli] = useState(19500000);
  const [hargaJual, setHargaJual] = useState(23500000);
  const [status, setStatus] = useState<"Tersedia" | "Terjual">("Tersedia");
  const [deskripsi, setDeskripsi] = useState(
    "Catatan kondisi fisik: Bodi 95% mulus orisinil tanpa bekas jatuh atau banjir, ban depan-belakang masih tebal, kunci kontak 2 pcs lengkap."
  );
  const [photos, setPhotos] = useState<FotoMotor[]>([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [newPhotoLabel, setNewPhotoLabel] = useState("Foto Tambahan");
  const [isUploading, setIsUploading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [showSeedModal, setShowSeedModal] = useState(false);
  const photoSeqRef = useRef(10000);

  const handleConfirmSeedDataset = async () => {
    try {
      setIsSeeding(true);
      const res = await fetch("/api/motor/seed", { method: "POST" });
      const json = await res.json();
      setShowSeedModal(false);
      if (res.ok && json.success) {
        triggerToast(json.message);
        await refreshData(true);
      } else {
        triggerToast(json.message || "Gagal mengimpor dataset.");
      }
    } catch (err: unknown) {
      setShowSeedModal(false);
      triggerToast(
        "Error: " + (err instanceof Error ? err.message : "Gagal mengimpor.")
      );
    } finally {
      setIsSeeding(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (res.ok && json.success && json.url) {
        photoSeqRef.current += 1;
        const nextPhotoId = photoSeqRef.current;
        setPhotos((prev) => [
          ...prev,
          {
            id_foto: nextPhotoId,
            id_motor: editingMotorId || 0,
            nama_file: json.url,
            label: newPhotoLabel.trim() || `Foto #${prev.length + 1}`,
            caption: `${newPhotoLabel.trim() || "Foto Unit"} - ${merek} ${tipe}`,
            is_utama: prev.length === 0,
          },
        ]);
        setNewPhotoUrl("");
        triggerToast("Foto berhasil diunggah dan ditambahkan ke galeri unit!");
      } else {
        triggerToast(json.message || "Gagal mengunggah foto.");
      }
    } catch (err: unknown) {
      triggerToast(
        "Error upload: " +
          (err instanceof Error ? err.message : "Gagal upload.")
      );
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const openAddModal = () => {
    setEditingMotorId(null);
    setMerek("Honda");
    setTipe("Vario 160 CBS");
    setNopol("AG 4819 KOX");
    setTahun(2023);
    setCc(160);
    setKilometer(12450);
    setDomisiliSamsat("Nganjuk (AG)");
    setKondisiMesin("Sangat Baik");
    setKelengkapanDokumen("Lengkap (STNK + BPKB)");
    setHargaBeli(19500000);
    setHargaJual(23500000);
    setStatus("Tersedia");
    setDeskripsi(
      "Catatan kondisi fisik: Bodi 95% mulus orisinil tanpa bekas jatuh atau banjir, ban depan-belakang masih bergaris bawaan pabrik, remote smartkey lengkap."
    );
    setPhotos([
      {
        id_foto: 10001,
        id_motor: 0,
        nama_file: "/logo.png",
        label: "Foto Placeholder",
        caption: "Silakan unggah foto asli unit motor",
        is_utama: true,
      },
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (motor: Motor) => {
    setEditingMotorId(motor.id_motor);
    setMerek(motor.merek);
    setTipe(motor.tipe);
    setNopol(motor.nopol);
    setTahun(motor.tahun);
    setCc(motor.cc);
    setKilometer(motor.kilometer);
    setDomisiliSamsat(motor.domisili_samsat);
    setKondisiMesin(motor.kondisi_mesin);
    setKelengkapanDokumen(motor.kelengkapan_dokumen);
    setHargaBeli(motor.harga_beli ?? 0);
    setHargaJual(motor.harga_jual);
    setStatus(motor.status);
    setDeskripsi(motor.deskripsi);
    setPhotos(motor.foto_motor);
    setIsModalOpen(true);
  };

  useEffect(() => {
    const editParam = searchParams.get("edit");
    if (!editParam) return;
    const targetId = parseInt(editParam, 10);
    if (isNaN(targetId)) return;
    const found = motors.find((m) => m.id_motor === targetId);
    if (found) {
      Promise.resolve().then(() => {
        setEditingMotorId(found.id_motor);
        setMerek(found.merek);
        setTipe(found.tipe);
        setNopol(found.nopol);
        setTahun(found.tahun);
        setCc(found.cc);
        setKilometer(found.kilometer);
        setDomisiliSamsat(found.domisili_samsat);
        setKondisiMesin(found.kondisi_mesin);
        setKelengkapanDokumen(found.kelengkapan_dokumen);
        setHargaBeli(found.harga_beli ?? 0);
        setHargaJual(found.harga_jual);
        setStatus(found.status);
        setDeskripsi(found.deskripsi);
        setPhotos(found.foto_motor);
        setIsModalOpen(true);
        router.replace("/admin/data-motor", { scroll: false });
      });
    }
  }, [searchParams, motors, router]);

  const handleApplyMLRecommendation = () => {
    const result = calculateMLPrediction({
      merek,
      tahun,
      cc,
      kilometer,
      kondisi_mesin: kondisiMesin,
      kelengkapan_dokumen: kelengkapanDokumen,
      domisili_samsat: domisiliSamsat,
      harga_beli: hargaBeli,
    });
    setHargaJual(result.estimatedPrice);
    triggerToast(
      `Rekomendasi ML diterapkan: ${formatRupiah(result.estimatedPrice)}`
    );
  };

  const handleSetMainPhoto = (id_foto: number) => {
    setPhotos((prev) =>
      prev.map((p) => ({
        ...p,
        is_utama: p.id_foto === id_foto,
      }))
    );
  };

  const handleDeletePhotoSlot = (id_foto: number) => {
    if (photos.length <= 1) {
      triggerToast("Minimal 1 foto utama wajib dipertahankan.");
      return;
    }
    const remaining = photos.filter((p) => p.id_foto !== id_foto);
    if (!remaining.some((p) => p.is_utama)) {
      remaining[0].is_utama = true;
    }
    setPhotos(remaining);
  };

  const handleAddCustomPhoto = () => {
    const url = newPhotoUrl.trim() || "/logo.png";
    photoSeqRef.current += 1;
    const nextPhotoId = photoSeqRef.current;
    setPhotos((prev) => [
      ...prev,
      {
        id_foto: nextPhotoId,
        id_motor: editingMotorId || 0,
        nama_file: url,
        label: newPhotoLabel.trim() || `Foto #${prev.length + 1}`,
        caption: `${newPhotoLabel.trim() || "Foto Unit"} - ${merek} ${tipe}`,
        is_utama: prev.length === 0,
      },
    ]);
    setNewPhotoUrl("");
  };

  const handleSaveMotor = async (e: React.FormEvent) => {
    e.preventDefault();
    const skuCode = `RDK-${String(tahun).slice(-2)}-${tipe
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()
      .slice(0, 5)}-AG`;

    setIsSaving(true);

    const res =
      editingMotorId !== null
        ? await updateMotor(editingMotorId, {
            merek,
            tipe,
            nopol: nopol.trim().toUpperCase(),
            tahun,
            cc,
            kilometer,
            domisili_samsat: domisiliSamsat,
            kondisi_mesin: kondisiMesin,
            kelengkapan_dokumen: kelengkapanDokumen,
            harga_beli: hargaBeli,
            harga_jual: hargaJual,
            status,
            deskripsi,
            foto_motor: photos,
          })
        : await addMotor({
            id_user: 1,
            sku: skuCode,
            nopol: nopol.trim().toUpperCase(),
            merek,
            tipe,
            tahun,
            cc,
            kilometer,
            kondisi_mesin: kondisiMesin,
            kelengkapan_dokumen: kelengkapanDokumen,
            domisili_samsat: domisiliSamsat,
            pajak_info: "Pajak hidup aktif",
            harga_beli: hargaBeli,
            harga_jual: hargaJual,
            harga_pasar_coret: Math.round((hargaJual * 1.05) / 50000) * 50000,
            deskripsi,
            status,
            foto_motor: photos,
          });

    setIsSaving(false);

    if (!res.success) {
      triggerToast(res.message || "Gagal menyimpan data motor ke server.");
      return;
    }

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsModalOpen(false);
      triggerToast(
        editingMotorId !== null
          ? `Data motor ${merek} ${tipe} berhasil diperbarui!`
          : `Unit baru ${merek} ${tipe} berhasil disimpan ke katalog!`
      );
    }, 600);
  };

  const handleConfirmDelete = async () => {
    if (!deletingMotor) return;
    const target = deletingMotor;
    setIsDeleting(true);
    const res = await deleteMotor(target.id_motor);
    setIsDeleting(false);
    setDeletingMotor(null);
    triggerToast(
      res.success
        ? `Unit ${target.merek} ${target.tipe} berhasil dihapus dari inventaris.`
        : res.message || "Gagal menghapus motor."
    );
  };

  const handleExportCSV = () => {
    const headers = [
      "ID Motor",
      "Merek",
      "Tipe",
      "Nopol",
      "Tahun",
      "CC",
      "Kilometer",
      "Kondisi Mesin",
      "Kelengkapan Dokumen",
      "Domisili Samsat",
      "Harga Beli",
      "Harga Jual",
      "Status",
    ];
    const rows = motors.map((m) => [
      m.id_motor,
      m.merek,
      `"${m.tipe}"`,
      `"${m.nopol}"`,
      m.tahun,
      m.cc,
      m.kilometer,
      `"${m.kondisi_mesin}"`,
      `"${m.kelengkapan_dokumen}"`,
      `"${m.domisili_samsat}"`,
      m.harga_beli ?? 0,
      m.harga_jual,
      m.status,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "data_motor_rodamotorku.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("Berkas CSV inventaris motor berhasil diunduh.");
  };

  const brands = useMemo(() => [...new Set(motors.map((motor) => motor.merek))].sort(), [motors]);
  const years = useMemo(() => [...new Set(motors.map((motor) => motor.tahun))].sort((a, b) => b - a), [motors]);
  const prices = useMemo(() => [...new Set(motors.map((motor) => motor.harga_jual))].sort((a, b) => a - b), [motors]);
  const priceCuts = useMemo(() => [
    prices[Math.floor((prices.length - 1) / 3)] ?? 0,
    prices[Math.floor(((prices.length - 1) * 2) / 3)] ?? 0,
  ], [prices]);

  const filteredMotors = useMemo(() => {
    const list = motors.filter((m) => {
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        `${m.merek} ${m.tipe}`.toLowerCase().includes(q) ||
        m.nopol.toLowerCase().includes(q) ||
        m.domisili_samsat.toLowerCase().includes(q);
      const matchBrand = !brandFilter || m.merek === brandFilter;
      const matchStatus = !statusFilter || m.status === statusFilter;
      const matchYear = !yearFilter || String(m.tahun) === yearFilter;
      const matchPrice =
        !priceFilter ||
        (priceFilter === "low" && m.harga_jual <= priceCuts[0]) ||
        (priceFilter === "mid" && m.harga_jual > priceCuts[0] && m.harga_jual <= priceCuts[1]) ||
        (priceFilter === "high" && m.harga_jual > priceCuts[1]);
      return matchSearch && matchBrand && matchStatus && matchYear && matchPrice;
    });

    return [...list].sort((a, b) => {
      if (sortBy === "harga_asc") return a.harga_jual - b.harga_jual;
      if (sortBy === "harga_desc") return b.harga_jual - a.harga_jual;
      if (sortBy === "km_asc") return a.kilometer - b.kilometer;
      return b.id_motor - a.id_motor;
    });
  }, [motors, searchQuery, brandFilter, statusFilter, sortBy, yearFilter, priceFilter, priceCuts]);

  const totalPages = Math.max(1, Math.ceil(filteredMotors.length / ROWS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedMotors = filteredMotors.slice((safeCurrentPage - 1) * ROWS_PER_PAGE, safeCurrentPage * ROWS_PER_PAGE);
  const pageBlockStart = Math.floor((safeCurrentPage - 1) / 10) * 10 + 1;
  const pageBlockEnd = Math.min(pageBlockStart + 9, totalPages);

  const totalUnits = motors.length;
  const readyUnits = motors.filter((m) => m.status === "Tersedia").length;
  const soldUnits = motors.filter((m) => m.status === "Terjual").length;
  const totalValue = motors.reduce((acc, m) => acc + m.harga_jual, 0);

  return (
    <div className="flex flex-col w-full relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-space-md py-space-sm rounded-lg shadow-xl flex items-center gap-space-sm">
          <span className="material-symbols-outlined text-tertiary-fixed text-[20px]">
            check_circle
          </span>
          <span className="font-label-md text-label-md">{toastMessage}</span>
        </div>
      )}

      {/* Top Stats & Metric Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-space-md mb-space-lg">
        <div className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant/60 shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Total Unit
            </span>
            <span className="font-headline-md text-headline-md text-on-surface mt-space-xs font-bold tabular-nums">
              <CountUpNumber value={totalUnits} /> Unit
            </span>
          </div>
          <div className="w-11 h-11 rounded-DEFAULT bg-primary-container/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">
              garage
            </span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant/60 shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Stok Tersedia
            </span>
            <span className="font-headline-md text-headline-md text-primary mt-space-xs font-bold tabular-nums">
              <CountUpNumber value={readyUnits} /> Unit
            </span>
          </div>
          <div className="w-11 h-11 rounded-DEFAULT bg-tertiary-fixed text-on-tertiary-fixed-variant flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">
              check_circle
            </span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant/60 shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Unit Terjual
            </span>
            <span className="font-headline-md text-headline-md text-primary mt-space-xs font-bold tabular-nums">
              <CountUpNumber value={soldUnits} /> Unit
            </span>
          </div>
          <div className="w-11 h-11 rounded-DEFAULT bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">
              shopping_bag
            </span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant/60 shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Nilai Inventaris
            </span>
            <span className="font-headline-md text-headline-md text-on-surface mt-space-xs font-bold tabular-nums">
              Rp {(totalValue / 1000000).toFixed(1)} Jt
            </span>
          </div>
          <div className="w-11 h-11 rounded-DEFAULT bg-primary-fixed text-on-primary-fixed flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">
              account_balance_wallet
            </span>
          </div>
        </div>
      </div>

      {/* Header Section & Operational Controls */}
      <div className="bg-surface-container-lowest p-space-lg rounded-xl border border-outline-variant/60 shadow-sm mb-space-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md pb-space-md">
          <div className="flex flex-col">
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">
              Kelola Data Motor
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-space-sm shrink-0">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center px-space-md py-2.5 rounded-DEFAULT bg-surface-container hover:bg-surface-variant text-on-surface font-label-md text-label-md transition-colors shadow-sm cursor-pointer"
              type="button"
            >
              <span>Ekspor CSV</span>
            </button>
            <button
              onClick={() => setShowSeedModal(true)}
              disabled={isSeeding}
              className="inline-flex items-center gap-space-xs px-space-md py-2.5 rounded-DEFAULT bg-secondary-container hover:bg-secondary-fixed text-on-secondary-fixed-variant font-label-md text-label-md transition-colors shadow-sm cursor-pointer disabled:opacity-50"
              type="button"
              title="Impor 187 data motor riil dari dataset Capstone ke basis data"
            >
              <span className="material-symbols-outlined text-[18px]">
                dataset
              </span>
              <span>{isSeeding ? "Mengimpor..." : "Impor Dataset (187 Unit)"}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center px-space-md py-2.5 rounded-DEFAULT bg-surface-container hover:bg-surface-variant text-on-surface font-label-md text-label-md transition-colors shadow-sm cursor-pointer"
              type="button"
            >
              <span>Cetak</span>
            </button>
            <button
              onClick={openAddModal}
              className="inline-flex items-center px-space-lg py-2.5 rounded-DEFAULT bg-primary-container text-on-primary hover:bg-primary font-label-md text-label-md font-semibold transition-all shadow-md cursor-pointer"
              type="button"
            >
              <span>Tambah Data Motor</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-space-sm pt-space-md">
          <div className="md:col-span-6 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
              search
            </span>
            <input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-space-md py-2 bg-surface rounded-DEFAULT text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
              placeholder="Cari merek, tipe, atau nomor polisi..."
              type="text"
            />
          </div>
          <div className="md:col-span-3">
            <div className="relative">
              <select
                value={brandFilter}
                onChange={(e) => {
                  setBrandFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full appearance-none pl-3 pr-8 py-2 bg-surface rounded-DEFAULT text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
              >
                <option value="">Semua Merek</option>
                {brands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]">
                expand_more
              </span>
            </div>
          </div>
          <div className="md:col-span-3">
            <select value={yearFilter} onChange={(e) => { setYearFilter(e.target.value); setCurrentPage(1); }} className="w-full appearance-none pl-3 pr-8 py-2 bg-surface rounded-DEFAULT text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm">
              <option value="">Semua Tahun</option>
              {years.map((year) => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>
          <div className="md:col-span-4">
            <select value={priceFilter} onChange={(e) => { setPriceFilter(e.target.value); setCurrentPage(1); }} className="w-full appearance-none pl-3 pr-8 py-2 bg-surface rounded-DEFAULT text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm">
              <option value="">Semua Harga</option>
              <option value="low">Harga rendah (≤ {formatRupiah(priceCuts[0])})</option>
              <option value="mid">Harga menengah</option>
              <option value="high">Harga tinggi (&gt; {formatRupiah(priceCuts[1])})</option>
            </select>
          </div>
          <div className="md:col-span-4">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full appearance-none pl-3 pr-8 py-2 bg-surface rounded-DEFAULT text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
              >
                <option value="">Semua Status</option>
                <option value="Tersedia">Tersedia</option>
                <option value="Terjual">Terjual</option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]">
                expand_more
              </span>
            </div>
          </div>
          <div className="md:col-span-4">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full appearance-none pl-3 pr-8 py-2 bg-surface rounded-DEFAULT text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
              >
                <option value="terbaru">Terbaru</option>
                <option value="harga_asc">Harga Terendah</option>
                <option value="harga_desc">Harga Tertinggi</option>
                <option value="km_asc">KM Terendah</option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]">
                sort
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table: Inventory Management */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 shadow-sm overflow-hidden mb-space-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-primary text-on-primary text-[12px] uppercase tracking-wider">
                <th className="py-3 px-space-md font-semibold">Unit Motor</th>
                <th className="py-3 px-space-md font-semibold">Tahun / CC</th>
                <th className="py-3 px-space-md font-semibold">Odometer</th>
                <th className="py-3 px-space-md font-semibold">Kondisi</th>
                <th className="py-3 px-space-md font-semibold text-right">
                  Harga Beli
                </th>
                <th className="py-3 px-space-md font-semibold text-right">
                  Harga Jual
                </th>
                <th className="py-3 px-space-md font-semibold text-center">
                  Status
                </th>
                <th className="py-3 px-space-md font-semibold text-center">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container text-[13px] text-on-surface bg-surface-container-lowest">
              {paginatedMotors.map((motor) => {
                const mainImg =
                  motor.foto_motor.find((f) => f.is_utama)?.nama_file ||
                  motor.foto_motor[0]?.nama_file ||
                  "/logo.png";
                const isReady = motor.status === "Tersedia";

                return (
                  <tr
                    key={motor.id_motor}
                    className="hover:bg-surface-container-low/70 transition-colors"
                  >
                    <td className="py-2.5 px-space-md">
                      <div className="flex items-center gap-space-sm">
                        <div className="w-12 h-9 bg-surface-container rounded-DEFAULT overflow-hidden relative shrink-0 shadow-xs">
                          <img
                            alt={`${motor.merek} ${motor.tipe}`}
                            className="w-full h-full object-cover"
                            src={mainImg}
                          />
                        </div>
                        <div className="flex flex-col">
                          <Link
                            href={`/katalog/${motor.id_motor}`}
                            className="text-[13px] font-semibold text-on-surface hover:text-primary"
                          >
                            {motor.merek} {motor.tipe}
                          </Link>
                          <div className="flex items-center gap-1.5 mt-0.5 text-on-surface-variant text-[11px]">
                            <span>{motor.nopol}</span>
                            <span className="text-outline-variant">•</span>
                            <span>{motor.domisili_samsat}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-space-md">
                      <div className="flex flex-col">
                        <span className="text-[13px] font-medium tabular-nums">
                          {motor.tahun}
                        </span>
                        <span className="text-on-surface-variant text-[11px]">
                          {motor.cc} cc
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-space-md text-[13px] tabular-nums">
                      {formatNumberID(motor.kilometer)} km
                    </td>
                    <td className="py-2.5 px-space-md">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[12px] font-medium text-on-tertiary-container">
                          {motor.kondisi_mesin}
                        </span>
                        <span className="text-on-surface-variant text-[11px]">
                          {motor.kelengkapan_dokumen.split("(")[0].trim()}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-space-md text-right text-[13px] text-primary tabular-nums">
                      {formatRupiah(motor.harga_beli ?? 0)}
                    </td>
                    <td className="py-2.5 px-space-md text-right text-[13px] font-semibold text-primary tabular-nums">
                      {formatRupiah(motor.harga_jual)}
                    </td>
                    <td className="py-2.5 px-space-md text-center">
                      {isReady ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-DEFAULT bg-tertiary-fixed text-on-tertiary-fixed-variant text-[11px] font-semibold">
                          Tersedia
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-DEFAULT bg-surface-variant text-on-surface-variant text-[11px] font-semibold">
                          Terjual
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-space-md text-center">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(motor)}
                          className="w-7 h-7 rounded-DEFAULT hover:bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                          title="Ubah Data & Foto"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[17px]">
                            edit
                          </span>
                        </button>
                        <Link
                          href={`/katalog/${motor.id_motor}`}
                          className="w-7 h-7 rounded-DEFAULT hover:bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
                          title="Lihat di Katalog"
                        >
                          <span className="material-symbols-outlined text-primary text-[17px]">
                            visibility
                          </span>
                        </Link>
                        <button
                          onClick={() => setDeletingMotor(motor)}
                          className="w-7 h-7 rounded-DEFAULT hover:bg-error-container flex items-center justify-center text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                          title="Hapus Unit"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[17px]">
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

        <div className="flex items-center justify-between px-space-md py-2.5 bg-surface-container-low text-on-surface-variant text-[12px]">
          <span>
            Menampilkan{" "}
            <strong className="text-on-surface font-semibold">
              {filteredMotors.length === 0 ? 0 : (safeCurrentPage - 1) * ROWS_PER_PAGE + 1}–{Math.min(safeCurrentPage * ROWS_PER_PAGE, filteredMotors.length)}
            </strong>{" "}
            dari{" "}
            <strong className="text-on-surface font-semibold">
              {filteredMotors.length}
            </strong>{" "}
            unit
          </span>
          {totalPages > 1 && <nav aria-label="Navigasi halaman data motor" className="flex items-center gap-1">
            <button type="button" onClick={() => setCurrentPage(Math.max(1, pageBlockStart - 1))} disabled={pageBlockStart === 1} className="px-2.5 py-1.5 rounded bg-white text-primary disabled:opacity-40">Prev</button>
            {Array.from({ length: Math.max(0, pageBlockEnd - pageBlockStart + 1) }, (_, i) => pageBlockStart + i).map((page) => <button key={page} type="button" aria-current={safeCurrentPage === page ? "page" : undefined} onClick={() => setCurrentPage(page)} className={`min-w-8 px-2.5 py-1.5 rounded ${safeCurrentPage === page ? "bg-primary text-white" : "bg-white text-primary"}`}>{page}</button>)}
            <button type="button" onClick={() => setCurrentPage(Math.min(totalPages, pageBlockEnd + 1))} disabled={pageBlockEnd === totalPages} className="px-2.5 py-1.5 rounded bg-white text-primary disabled:opacity-40">Next</button>
          </nav>}
        </div>
      </div>

      {/* MODAL POPUP FORM (TAMBAH / UBAH DATA MOTOR & FOTO_MOTOR) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/60 backdrop-blur-sm">
          <form
            onSubmit={handleSaveMotor}
            className="relative w-full max-w-5xl bg-surface-container-lowest rounded-DEFAULT shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto"
          >
            {/* Saving & Success Feedback Overlay */}
            {isSaving && (
              <div className="absolute inset-0 z-50 bg-surface/85 backdrop-blur-xs flex flex-col items-center justify-center gap-3 animate-in fade-in">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                  <span className="material-symbols-outlined text-primary text-[24px]">
                    two_wheeler
                  </span>
                </div>
                <div className="text-center">
                  <h3 className="font-headline-sm text-headline-sm font-bold text-primary">
                    {editingMotorId !== null
                      ? "Memperbarui Data Motor..."
                      : "Menyimpan Unit Baru..."}
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Memproses spesifikasi teknis dan galeri foto...
                  </p>
                </div>
              </div>
            )}

            {saveSuccess && (
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
                    {editingMotorId !== null
                      ? "Data Motor Berhasil Diperbarui!"
                      : "Unit Motor Berhasil Ditambahkan!"}
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Inventaris showroom telah disinkronkan ke katalog.
                  </p>
                </div>
              </div>
            )}

            {/* Modal Header */}
            <div className="px-space-lg py-space-md bg-primary-container text-on-primary flex items-center justify-between shrink-0 shadow-sm">
              <div className="flex items-center gap-space-sm">
                <div className="w-9 h-9 rounded-DEFAULT bg-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary-fixed text-[22px]">
                    post_add
                  </span>
                </div>
                <h2 className="font-headline-sm text-headline-sm font-bold text-on-primary tracking-tight">
                  {editingMotorId !== null
                    ? "Ubah Data Unit Motor"
                    : "Tambah Unit Motor Baru"}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-DEFAULT bg-primary/60 hover:bg-primary flex items-center justify-center text-on-primary transition-colors cursor-pointer"
                title="Tutup Modal"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">
                  close
                </span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-space-lg overflow-y-auto space-y-space-lg bg-surface">
              {/* SEKSI 1: Spesifikasi Unit */}
              <div className="bg-surface-container-lowest p-space-lg rounded-DEFAULT shadow-sm">
                <div className="flex items-center gap-space-xs pb-space-sm mb-space-md bg-surface-container-low -mx-space-lg -mt-space-lg px-space-lg pt-space-sm rounded-t-DEFAULT text-primary font-label-lg text-label-lg font-bold">
                  <span className="material-symbols-outlined text-[20px]">
                    two_wheeler
                  </span>
                  <span>Spesifikasi &amp; Harga Unit</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-space-md">
                  {/* Merek */}
                  <div className="md:col-span-3 flex flex-col gap-1">
                    <label className="font-label-sm text-label-sm font-semibold text-on-surface">
                      Merek <span className="text-error">*</span>
                    </label>
                    <select
                      value={merek}
                      onChange={(e) =>
                        setMerek(e.target.value as Motor["merek"])
                      }
                      className="w-full px-3 py-2 bg-surface rounded-DEFAULT text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                      required
                    >
                      <option value="Honda">Honda</option>
                      <option value="Yamaha">Yamaha</option>
                      <option value="Suzuki">Suzuki</option>
                      <option value="Kawasaki">Kawasaki</option>
                      <option value="Vespa">Vespa</option>
                    </select>
                  </div>

                  {/* Tipe Motor */}
                  <div className="md:col-span-5 flex flex-col gap-1">
                    <label className="font-label-sm text-label-sm font-semibold text-on-surface">
                      Tipe &amp; Varian <span className="text-error">*</span>
                    </label>
                    <input
                      value={tipe}
                      onChange={(e) => setTipe(e.target.value)}
                      className="w-full px-3 py-2 bg-surface rounded-DEFAULT text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                      placeholder="Misal: Vario 160 CBS"
                      required
                      type="text"
                    />
                  </div>

                  {/* Nomor Polisi */}
                  <div className="md:col-span-4 flex flex-col gap-1">
                    <label className="font-label-sm text-label-sm font-semibold text-on-surface">
                      Nomor Polisi <span className="text-error">*</span>
                    </label>
                    <div className="flex items-center">
                      <span className="bg-surface-container text-on-surface-variant px-2.5 py-2 font-mono font-semibold rounded-l-DEFAULT text-[13px] shadow-sm">
                        IND
                      </span>
                      <input
                        value={nopol}
                        onChange={(e) => setNopol(e.target.value.toUpperCase())}
                        className="w-full px-3 py-2 bg-surface rounded-r-DEFAULT text-on-surface font-mono font-bold text-body-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm uppercase"
                        placeholder="B 1234 XYZ"
                        required
                        type="text"
                      />
                    </div>
                  </div>

                  {/* Tahun Pembuatan */}
                  <div className="md:col-span-3 flex flex-col gap-1">
                    <label className="font-label-sm text-label-sm font-semibold text-on-surface">
                      Tahun <span className="text-error">*</span>
                    </label>
                    <input
                      value={tahun}
                      onChange={(e) =>
                        setTahun(parseInt(e.target.value, 10) || 2023)
                      }
                      className="w-full px-3 py-2 bg-surface rounded-DEFAULT text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm tabular-nums"
                      max={2030}
                      min={1990}
                      required
                      type="number"
                    />
                  </div>

                  {/* CC */}
                  <div className="md:col-span-3 flex flex-col gap-1">
                    <label className="font-label-sm text-label-sm font-semibold text-on-surface">
                      Kapasitas (CC) <span className="text-error">*</span>
                    </label>
                    <input
                      value={cc}
                      onChange={(e) =>
                        setCc(parseInt(e.target.value, 10) || 110)
                      }
                      className="w-full px-3 py-2 bg-surface rounded-DEFAULT text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm tabular-nums"
                      required
                      type="number"
                    />
                  </div>

                  {/* Kilometer */}
                  <div className="md:col-span-3 flex flex-col gap-1">
                    <label className="font-label-sm text-label-sm font-semibold text-on-surface">
                      Kilometer <span className="text-error">*</span>
                    </label>
                    <input
                      value={kilometer}
                      onChange={(e) =>
                        setKilometer(parseInt(e.target.value, 10) || 0)
                      }
                      className="w-full px-3 py-2 bg-surface rounded-DEFAULT text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm tabular-nums"
                      required
                      type="number"
                    />
                  </div>

                  {/* Domisili Samsat */}
                  <div className="md:col-span-3 flex flex-col gap-1">
                    <label className="font-label-sm text-label-sm font-semibold text-on-surface">
                      Domisili Samsat <span className="text-error">*</span>
                    </label>
                    <select
                      value={domisiliSamsat}
                      onChange={(e) => setDomisiliSamsat(e.target.value)}
                      className="w-full px-3 py-2 bg-surface rounded-DEFAULT text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    >
                      {!DATASET_SAMSAT_OPTIONS.includes(domisiliSamsat) && domisiliSamsat && (
                        <option value={domisiliSamsat}>{domisiliSamsat}</option>
                      )}
                      {DATASET_SAMSAT_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Kondisi Mesin */}
                  <div className="md:col-span-6 flex flex-col gap-1">
                    <label className="font-label-sm text-label-sm font-semibold text-on-surface">
                      Kondisi Mesin <span className="text-error">*</span>
                    </label>
                    <select
                      value={kondisiMesin}
                      onChange={(e) => setKondisiMesin(e.target.value)}
                      className="w-full px-3 py-2 bg-surface rounded-DEFAULT text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    >
                      {!DATASET_KONDISI_OPTIONS.includes(kondisiMesin) && kondisiMesin && (
                        <option value={kondisiMesin}>{kondisiMesin}</option>
                      )}
                      {DATASET_KONDISI_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Kelengkapan Dokumen */}
                  <div className="md:col-span-6 flex flex-col gap-1">
                    <label className="font-label-sm text-label-sm font-semibold text-on-surface">
                      Kelengkapan Dokumen <span className="text-error">*</span>
                    </label>
                    <select
                      value={kelengkapanDokumen}
                      onChange={(e) => setKelengkapanDokumen(e.target.value)}
                      className="w-full px-3 py-2 bg-surface rounded-DEFAULT text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    >
                      {!DATASET_DOKUMEN_OPTIONS.includes(kelengkapanDokumen) && kelengkapanDokumen && (
                        <option value={kelengkapanDokumen}>{kelengkapanDokumen}</option>
                      )}
                      {DATASET_DOKUMEN_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Harga Beli */}
                  <div className="md:col-span-6 flex flex-col gap-1">
                    <label className="font-label-sm text-label-sm font-semibold text-on-surface">
                      Harga Beli <span className="text-error">*</span>
                    </label>
                    <div className="flex items-center">
                      <span className="bg-surface-container text-on-surface-variant px-3 py-2 font-mono font-bold rounded-l-DEFAULT text-[13px] shadow-sm">
                        Rp
                      </span>
                      <input
                        value={hargaBeli}
                        onChange={(e) =>
                          setHargaBeli(parseInt(e.target.value, 10) || 0)
                        }
                        className="w-full px-3 py-2 bg-surface rounded-r-DEFAULT text-on-surface font-mono font-semibold text-body-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                        required
                        type="number"
                      />
                    </div>
                  </div>

                  {/* Harga Jual Akhir */}
                  <div className="md:col-span-6 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <label className="font-label-sm text-label-sm font-semibold text-on-surface">
                        Harga Jual <span className="text-error">*</span>
                      </label>
                      <button
                        onClick={handleApplyMLRecommendation}
                        className="inline-flex items-center gap-1 text-[11px] font-label-sm text-primary font-bold hover:underline cursor-pointer"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          auto_graph
                        </span>{" "}
                        Rekomendasi ML
                      </button>
                    </div>
                    <div className="flex items-center">
                      <span className="bg-primary-container text-on-primary px-3 py-2 font-mono font-bold rounded-l-DEFAULT text-[13px] shadow-sm">
                        Rp
                      </span>
                      <input
                        value={hargaJual}
                        onChange={(e) =>
                          setHargaJual(parseInt(e.target.value, 10) || 0)
                        }
                        className="w-full px-3 py-2 bg-surface rounded-r-DEFAULT text-primary font-mono font-bold text-body-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                        required
                        type="number"
                      />
                    </div>
                  </div>

                  {/* Status Ketersediaan */}
                  <div className="md:col-span-12 flex flex-col sm:flex-row sm:items-center justify-between p-space-sm bg-surface rounded-DEFAULT shadow-sm gap-space-sm">
                    <span className="font-label-md text-label-md font-semibold text-on-surface">
                      Status Ketersediaan
                    </span>
                    <div className="inline-flex p-1 bg-surface-container rounded-DEFAULT shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => setStatus("Tersedia")}
                        className={`px-3 py-1.5 rounded-DEFAULT font-label-sm text-label-sm font-bold cursor-pointer ${
                          status === "Tersedia"
                            ? "bg-surface-container-lowest text-on-tertiary-container shadow-sm"
                            : "text-on-surface-variant"
                        }`}
                      >
                        ● Tersedia
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatus("Terjual")}
                        className={`px-3 py-1.5 rounded-DEFAULT font-label-sm text-label-sm font-bold cursor-pointer ${
                          status === "Terjual"
                            ? "bg-surface-container-lowest text-primary shadow-sm"
                            : "text-on-surface-variant"
                        }`}
                      >
                        Terjual
                      </button>
                    </div>
                  </div>

                  {/* Deskripsi Tambahan */}
                  <div className="md:col-span-12 flex flex-col gap-1">
                    <label className="font-label-sm text-label-sm font-semibold text-on-surface">
                      Deskripsi Unit
                    </label>
                    <textarea
                      value={deskripsi}
                      onChange={(e) => setDeskripsi(e.target.value)}
                      className="w-full p-3 bg-surface rounded-DEFAULT text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm leading-relaxed"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* SEKSI 2: Area Unggah Berkas Foto Motor */}
              <div className="bg-surface-container-lowest p-space-lg rounded-DEFAULT shadow-sm">
                <div className="flex items-center gap-space-xs pb-space-sm mb-space-md bg-surface-container-low -mx-space-lg -mt-space-lg px-space-lg pt-space-sm rounded-t-DEFAULT text-primary font-label-lg text-label-lg font-bold">
                  <span className="material-symbols-outlined text-[20px]">
                    photo_library
                  </span>
                  <span>Galeri Foto Unit</span>
                </div>

                {/* Add Photo Slot Bar */}
                <div className="p-space-md rounded-DEFAULT bg-surface-container-low/60 mb-space-md flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    value={newPhotoLabel}
                    onChange={(e) => setNewPhotoLabel(e.target.value)}
                    placeholder="Label Foto (Misal: Tampak Depan)"
                    className="sm:w-48 px-3 py-2 bg-surface-container-lowest rounded-DEFAULT text-body-sm"
                    type="text"
                  />
                  <input
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    placeholder="URL gambar atau unggah berkas dari perangkat..."
                    className="flex-1 px-3 py-2 bg-surface-container-lowest rounded-DEFAULT text-body-sm"
                    type="text"
                  />
                  <label className="px-3 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-DEFAULT font-label-sm text-label-sm font-semibold cursor-pointer flex items-center justify-center gap-1 border border-outline-variant/40 shrink-0">
                    <span className="material-symbols-outlined text-[16px]">
                      upload_file
                    </span>
                    <span>{isUploading ? "Mengunggah..." : "Pilih File"}</span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleAddCustomPhoto}
                    className="px-4 py-2 bg-primary-container hover:bg-primary text-on-primary rounded-DEFAULT font-label-sm text-label-sm font-semibold cursor-pointer"
                  >
                    + Tambah Foto
                  </button>
                </div>

                {/* Uploaded Photos Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-sm">
                  {photos.map((photo, idx) => (
                    <div
                      key={photo.id_foto}
                      className="bg-surface rounded-DEFAULT overflow-hidden shadow-sm flex flex-col relative group"
                    >
                      <div className="relative h-36 bg-surface-container">
                        <img
                          alt={photo.label}
                          className="w-full h-full object-cover"
                          src={photo.nama_file}
                        />
                        {photo.is_utama && (
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-DEFAULT bg-tertiary text-on-tertiary font-label-sm text-label-sm font-bold flex items-center gap-1 shadow-sm">
                            <span className="material-symbols-outlined text-[14px]">
                              star
                            </span>{" "}
                            Utama
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeletePhotoSlot(photo.id_foto)}
                          className="absolute top-2 right-2 w-7 h-7 rounded-DEFAULT bg-inverse-surface/80 hover:bg-error text-white flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                          title="Hapus Berkas"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            delete
                          </span>
                        </button>
                      </div>
                      <div className="p-2.5 flex flex-col gap-1.5 bg-surface-container-lowest">
                        <span className="font-label-sm text-label-sm font-semibold truncate text-on-surface">
                          {idx + 1}. {photo.label}
                        </span>
                        <label className="inline-flex items-center gap-1.5 text-on-tertiary-fixed-variant text-[12px] font-semibold cursor-pointer">
                          <input
                            checked={photo.is_utama}
                            onChange={() => handleSetMainPhoto(photo.id_foto)}
                            className="accent-tertiary"
                            name="is_utama_radio"
                            type="radio"
                          />
                          <span>
                            {photo.is_utama ? "Foto Utama" : "Jadikan Utama"}
                          </span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-space-lg py-space-md bg-surface-container-lowest flex flex-col sm:flex-row items-center justify-between gap-space-sm shrink-0 shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
              <span className="text-on-surface-variant font-body-sm text-body-sm">
                Kolom bertanda <span className="text-error font-bold">*</span>{" "}
                wajib diisi.
              </span>
              <div className="flex items-center gap-space-sm w-full sm:w-auto justify-end">
                <button
                  disabled={isSaving || saveSuccess}
                  onClick={() => setIsModalOpen(false)}
                  className="px-space-md py-2.5 rounded-DEFAULT bg-surface-container hover:bg-surface-variant text-on-surface font-label-md text-label-md font-semibold transition-colors shadow-sm cursor-pointer disabled:opacity-60"
                  type="button"
                >
                  Batal
                </button>
                <button
                  disabled={isSaving || saveSuccess}
                  className="inline-flex items-center gap-space-xs px-space-lg py-2.5 rounded-DEFAULT bg-primary hover:bg-primary/90 text-on-primary font-label-md text-label-md font-bold transition-all shadow-md cursor-pointer disabled:opacity-75"
                  type="submit"
                >
                  {isSaving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin"></span>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px]">
                        check_circle
                      </span>
                      <span>Simpan Data</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingMotor && (
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
                  Hapus Unit Motor
                </h3>
                <span className="text-[12px] text-on-surface-variant font-medium">
                  {deletingMotor.nopol}
                </span>
              </div>
            </div>

            <p className="font-body-md text-body-md text-on-surface-variant">
              Apakah Anda yakin ingin menghapus unit{" "}
              <strong className="text-primary">
                {deletingMotor.merek} {deletingMotor.tipe} ({deletingMotor.tahun})
              </strong>{" "}
              dari sistem inventaris showroom?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-outline-variant/30">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingMotor(null)}
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
      {/* Seed 187 Dataset Confirmation Modal */}
      {showSeedModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-200 animate-in fade-in">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-2xl p-6 max-w-sm w-full flex flex-col gap-4 text-left animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary-container text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">
                  dataset
                </span>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm font-bold text-primary tracking-tight">
                  Impor 187 Dataset Capstone
                </h3>
                <span className="text-[12px] text-on-surface-variant font-medium">
                  Reset &amp; Seed Inventaris
                </span>
              </div>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Apakah Anda yakin ingin mengimpor ulang 187 unit motor riil dari dataset Capstone ke basis data showroom?
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-outline-variant/30">
              <button
                type="button"
                disabled={isSeeding}
                onClick={() => setShowSeedModal(false)}
                className="px-4 py-2 rounded-xl text-primary font-label-md text-label-md font-semibold bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer disabled:opacity-60"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSeeding}
                onClick={handleConfirmSeedDataset}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer disabled:opacity-60"
              >
                {isSeeding ? "Mengimpor..." : "Ya, Impor 187 Unit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function KelolaDataMotorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[320px] flex items-center justify-center">
          <span className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin"></span>
        </div>
      }
    >
      <KelolaDataMotorContent />
    </Suspense>
  );
}
