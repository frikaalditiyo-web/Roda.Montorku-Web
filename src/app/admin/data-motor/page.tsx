"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useShowroom } from "@/context/ShowroomContext";
import {
  calculateMLPrediction,
  formatNumberID,
  formatRupiah,
  FotoMotor,
  Motor,
} from "@/data/mockShowroomData";

export default function KelolaDataMotorPage() {
  const { motors, addMotor, updateMotor, deleteMotor } = useShowroom();

  const [searchQuery, setSearchQuery] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("terbaru");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMotorId, setEditingMotorId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal Form State (Tabel `motor` & `foto_motor`)
  const [merek, setMerek] = useState<Motor["merek"]>("Honda");
  const [tipe, setTipe] = useState("Vario 160 CBS");
  const [nopol, setNopol] = useState("B 4819 KOX");
  const [tahun, setTahun] = useState(2023);
  const [cc, setCc] = useState(160);
  const [kilometer, setKilometer] = useState(12450);
  const [domisiliSamsat, setDomisiliSamsat] = useState(
    "Jakarta Selatan (Plat B)"
  );
  const [kondisiMesin, setKondisiMesin] = useState("Sangat Baik");
  const [kelengkapanDokumen, setKelengkapanDokumen] = useState(
    "Lengkap (STNK + BPKB + Faktur)"
  );
  const [hargaBeli, setHargaBeli] = useState(19500000);
  const [hargaJual, setHargaJual] = useState(23500000);
  const [status, setStatus] = useState<"Tersedia" | "Terjual">("Tersedia");
  const [deskripsi, setDeskripsi] = useState(
    "Catatan kondisi fisik: Bodi 95% mulus orisinil tanpa bekas jatuh atau banjir, ban depan-belakang masih tebal, kunci kontak 2 pcs lengkap."
  );
  const [photos, setPhotos] = useState<FotoMotor[]>(motors[0]?.foto_motor || []);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [newPhotoLabel, setNewPhotoLabel] = useState("Foto Tambahan");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const openAddModal = () => {
    setEditingMotorId(null);
    setMerek("Honda");
    setTipe("Vario 160 CBS");
    setNopol("B 4819 KOX");
    setTahun(2023);
    setCc(160);
    setKilometer(12450);
    setDomisiliSamsat("Jakarta Selatan (Plat B)");
    setKondisiMesin("Sangat Baik");
    setKelengkapanDokumen("Lengkap (STNK + BPKB + Faktur)");
    setHargaBeli(19500000);
    setHargaJual(23500000);
    setStatus("Tersedia");
    setDeskripsi(
      "Catatan kondisi fisik: Bodi 95% mulus orisinil tanpa bekas jatuh atau banjir, ban depan-belakang masih bergaris bawaan pabrik, remote smartkey ada 2 pcs."
    );
    setPhotos(motors[0]?.foto_motor || []);
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
    setHargaBeli(motor.harga_beli);
    setHargaJual(motor.harga_jual);
    setStatus(motor.status);
    setDeskripsi(motor.deskripsi);
    setPhotos(motor.foto_motor);
    setIsModalOpen(true);
  };

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
    const url =
      newPhotoUrl.trim() ||
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCeKZ6MHGP-odobRcjSN-aeaH9mdtyoJ2dn65ZX8HrTay_V4JYgDcoX7_cTXUtpRTXniFBvA2DgZTwfGUbsSgVfjvZBSy1eNHF-33AoMDkL4U7opyMGLYO3RRVpmeZqB--q3mKZ7FZeJQtqr1gXZHRoypMyY-oaHFKsEbdnP4Gfu7468vat38VLiJg6DpwAhwOFbmTsG0SnvrNrDYc1WyDUxizFwV8CsMwX3aiigg6F";
    const nextPhotoId = Date.now();
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

  const handleSaveMotor = (e: React.FormEvent) => {
    e.preventDefault();
    const skuCode = `RDK-${String(tahun).slice(-2)}-${tipe
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()
      .slice(0, 5)}-JKT`;

    if (editingMotorId !== null) {
      updateMotor(editingMotorId, {
        merek,
        tipe,
        nopol,
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
      });
      triggerToast(`Data motor ${merek} ${tipe} berhasil diperbarui!`);
    } else {
      addMotor({
        id_user: 1,
        sku: skuCode,
        nopol,
        merek,
        tipe,
        tahun,
        cc,
        kilometer,
        kondisi_mesin: kondisiMesin,
        kelengkapan_dokumen: kelengkapanDokumen,
        domisili_samsat: domisiliSamsat,
        pajak_info: "Pajak hidup s/d Oktober 2026",
        harga_beli: hargaBeli,
        harga_jual: hargaJual,
        harga_pasar_coret: Math.round((hargaJual * 1.05) / 50000) * 50000,
        deskripsi,
        status,
        foto_motor: photos,
      });
      triggerToast(
        `Unit baru ${merek} ${tipe} berhasil disimpan ke katalog & database!`
      );
    }
    setIsModalOpen(false);
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
      m.harga_beli,
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
      return matchSearch && matchBrand && matchStatus;
    });

    return [...list].sort((a, b) => {
      if (sortBy === "harga_asc") return a.harga_jual - b.harga_jual;
      if (sortBy === "harga_desc") return b.harga_jual - a.harga_jual;
      if (sortBy === "km_asc") return a.kilometer - b.kilometer;
      return b.id_motor - a.id_motor;
    });
  }, [motors, searchQuery, brandFilter, statusFilter, sortBy]);

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
        <div className="bg-surface-container-lowest p-space-md rounded-DEFAULT shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Total Unit Terdata
            </span>
            <span className="font-headline-md text-headline-md text-on-surface mt-space-xs font-bold tabular-nums">
              {totalUnits} Unit
            </span>
            <span className="font-body-sm text-body-sm text-on-tertiary-container flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-[16px]">
                arrow_upward
              </span>{" "}
              Sinkron Tabel motor
            </span>
          </div>
          <div className="w-12 h-12 rounded-DEFAULT bg-primary-container/10 text-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-[26px]">
              garage
            </span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-DEFAULT shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Stok Tersedia (Ready)
            </span>
            <span className="font-headline-md text-headline-md text-primary mt-space-xs font-bold tabular-nums">
              {readyUnits} Unit
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              Tayang di katalog publik
            </span>
          </div>
          <div className="w-12 h-12 rounded-DEFAULT bg-tertiary-fixed text-on-tertiary-fixed-variant flex items-center justify-center">
            <span className="material-symbols-outlined text-[26px]">
              check_circle
            </span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-DEFAULT shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Unit Terjual
            </span>
            <span className="font-headline-md text-headline-md text-secondary mt-space-xs font-bold tabular-nums">
              {soldUnits} Unit
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              Data historis showroom
            </span>
          </div>
          <div className="w-12 h-12 rounded-DEFAULT bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center">
            <span className="material-symbols-outlined text-[26px]">
              shopping_bag
            </span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-DEFAULT shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Total Nilai Inventaris
            </span>
            <span className="font-headline-md text-headline-md text-on-surface mt-space-xs font-bold tabular-nums">
              Rp {(totalValue / 1000000).toFixed(1)} Jt
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              Estimasi Margin ~18.5%
            </span>
          </div>
          <div className="w-12 h-12 rounded-DEFAULT bg-primary-fixed text-on-primary-fixed flex items-center justify-center">
            <span className="material-symbols-outlined text-[26px]">
              account_balance_wallet
            </span>
          </div>
        </div>
      </div>

      {/* Header Section & Operational Controls */}
      <div className="bg-surface-container-lowest p-space-lg rounded-DEFAULT shadow-sm mb-space-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md pb-space-md">
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary text-[28px]">
                sports_motorsports
              </span>
              <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">
                Kelola Data Motor
              </h1>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs max-w-3xl">
              Manajemen inventaris unit showroom, spesifikasi teknis, harga beli
              &amp; jual, serta berkas foto fisik motor showroom Roda.Motorku.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-space-sm shrink-0">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-space-xs px-space-md py-2.5 rounded-DEFAULT bg-surface-container hover:bg-surface-variant text-on-surface font-label-md text-label-md transition-colors shadow-sm cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">
                download
              </span>
              <span>Ekspor CSV</span>
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-space-xs px-space-md py-2.5 rounded-DEFAULT bg-surface-container hover:bg-surface-variant text-on-surface font-label-md text-label-md transition-colors shadow-sm cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">
                print
              </span>
              <span>Cetak Katalog</span>
            </button>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-space-xs px-space-lg py-2.5 rounded-DEFAULT bg-primary-container text-on-primary hover:bg-primary font-label-md text-label-md font-semibold transition-all shadow-md cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">
                add_circle
              </span>
              <span>+ Tambah Data Motor</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-space-sm pt-space-md">
          <div className="md:col-span-5 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
              search
            </span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-space-md py-2 bg-surface rounded-DEFAULT text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
              placeholder="Cari merek, tipe, nomor polisi (B 4819 KOX)..."
              type="text"
            />
          </div>
          <div className="md:col-span-3">
            <div className="relative">
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2 bg-surface rounded-DEFAULT text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
              >
                <option value="">Semua Merek Pabrikan</option>
                <option value="Honda">Honda</option>
                <option value="Yamaha">Yamaha</option>
                <option value="Vespa">Vespa</option>
                <option value="Suzuki">Suzuki</option>
                <option value="Kawasaki">Kawasaki</option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]">
                expand_more
              </span>
            </div>
          </div>
          <div className="md:col-span-2">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2 bg-surface rounded-DEFAULT text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
              >
                <option value="">Status: Semua</option>
                <option value="Tersedia">Tersedia (Ready)</option>
                <option value="Terjual">Terjual (Sold)</option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]">
                expand_more
              </span>
            </div>
          </div>
          <div className="md:col-span-2">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2 bg-surface rounded-DEFAULT text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
              >
                <option value="terbaru">Urutan: Terbaru</option>
                <option value="harga_asc">Harga Terendah</option>
                <option value="harga_desc">Harga Tertinggi</option>
                <option value="km_asc">Kilometer Terendah</option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]">
                sort
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table: Inventory Management */}
      <div className="bg-surface-container-lowest rounded-DEFAULT shadow-sm overflow-hidden mb-space-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                <th className="py-3 px-space-md">Unit Motor &amp; Identitas</th>
                <th className="py-3 px-space-md">Tahun &amp; Mesin</th>
                <th className="py-3 px-space-md">Odometer</th>
                <th className="py-3 px-space-md">Kondisi &amp; Berkas</th>
                <th className="py-3 px-space-md text-right">
                  Harga Beli Showroom
                </th>
                <th className="py-3 px-space-md text-right">
                  Harga Jual Akhir
                </th>
                <th className="py-3 px-space-md text-center">Status</th>
                <th className="py-3 px-space-md text-center">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container font-body-sm text-body-sm text-on-surface">
              {filteredMotors.map((motor) => {
                const mainImg =
                  motor.foto_motor.find((f) => f.is_utama)?.nama_file ||
                  motor.foto_motor[0]?.nama_file;
                const isReady = motor.status === "Tersedia";

                return (
                  <tr
                    key={motor.id_motor}
                    className="hover:bg-surface-container-low/70 transition-colors"
                  >
                    <td className="py-3.5 px-space-md">
                      <div className="flex items-center gap-space-sm">
                        <div className="w-14 h-11 bg-surface-container rounded-DEFAULT overflow-hidden relative shrink-0 shadow-sm">
                          <img
                            alt={`${motor.merek} ${motor.tipe}`}
                            className="w-full h-full object-cover"
                            src={mainImg}
                          />
                          <span className="absolute bottom-0 right-0 bg-primary/80 text-[9px] text-white px-1 font-bold">
                            {motor.foto_motor.length} Gbr
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <Link
                            href={`/katalog/${motor.id_motor}`}
                            className="font-label-md text-label-md font-bold text-on-surface hover:text-primary"
                          >
                            {motor.merek} {motor.tipe}
                          </Link>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="px-1.5 py-0.5 rounded-DEFAULT bg-surface-container font-label-sm text-label-sm font-mono text-on-surface-variant">
                              {motor.nopol}
                            </span>
                            <span className="text-outline-variant">•</span>
                            <span className="text-on-surface-variant font-label-sm text-label-sm">
                              {motor.domisili_samsat}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-space-md">
                      <div className="flex flex-col">
                        <span className="font-label-md text-label-md font-semibold">
                          Tahun {motor.tahun}
                        </span>
                        <span className="text-on-surface-variant font-body-sm text-body-sm">
                          {motor.cc} cc
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-space-md">
                      <div className="flex items-center gap-1 font-mono font-semibold text-on-surface tabular-nums">
                        <span className="material-symbols-outlined text-outline text-[16px]">
                          speed
                        </span>
                        {formatNumberID(motor.kilometer)} km
                      </div>
                    </td>
                    <td className="py-3.5 px-space-md">
                      <div className="flex flex-col gap-0.5">
                        <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-on-tertiary-container">
                          <span className="w-1.5 h-1.5 rounded-full bg-on-tertiary-container"></span>{" "}
                          {motor.kondisi_mesin}
                        </span>
                        <span className="text-on-surface-variant text-[11px]">
                          {motor.kelengkapan_dokumen}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-space-md text-right font-mono font-medium text-secondary tabular-nums">
                      {formatRupiah(motor.harga_beli)}
                    </td>
                    <td className="py-3.5 px-space-md text-right font-mono font-bold text-primary tabular-nums">
                      {formatRupiah(motor.harga_jual)}
                    </td>
                    <td className="py-3.5 px-space-md text-center">
                      {isReady ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-DEFAULT bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-sm text-label-sm font-bold">
                          Tersedia
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-DEFAULT bg-surface-variant text-on-surface-variant font-label-sm text-label-sm font-semibold">
                          Terjual
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-space-md text-center">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(motor)}
                          className="w-8 h-8 rounded-DEFAULT hover:bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                          title="Ubah Data & Foto"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            edit
                          </span>
                        </button>
                        <Link
                          href={`/katalog/${motor.id_motor}`}
                          className="w-8 h-8 rounded-DEFAULT hover:bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
                          title="Lihat di Katalog"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            visibility
                          </span>
                        </Link>
                        <button
                          onClick={() => {
                            deleteMotor(motor.id_motor);
                            triggerToast(
                              `Unit ${motor.merek} ${motor.tipe} dihapus.`
                            );
                          }}
                          className="w-8 h-8 rounded-DEFAULT hover:bg-error-container flex items-center justify-center text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                          title="Hapus Unit"
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

        <div className="flex flex-col sm:flex-row items-center justify-between px-space-md py-space-sm bg-surface-container-low text-on-surface-variant font-body-sm text-body-sm">
          <span>
            Menampilkan{" "}
            <strong className="text-on-surface font-semibold">
              {filteredMotors.length}
            </strong>{" "}
            dari{" "}
            <strong className="text-on-surface font-semibold">
              {motors.length}
            </strong>{" "}
            unit motor terdaftar
          </span>
        </div>
      </div>

      {/* MODAL POPUP FORM (TAMBAH / UBAH DATA MOTOR & FOTO_MOTOR) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/60 backdrop-blur-sm">
          <form
            onSubmit={handleSaveMotor}
            className="relative w-full max-w-5xl bg-surface-container-lowest rounded-DEFAULT shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto"
          >
            {/* Modal Header */}
            <div className="px-space-lg py-space-md bg-primary-container text-on-primary flex items-center justify-between shrink-0 shadow-sm">
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-DEFAULT bg-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary-fixed text-[24px]">
                    post_add
                  </span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-space-xs">
                    <h2 className="font-headline-sm text-headline-sm font-bold text-on-primary tracking-tight">
                      {editingMotorId !== null
                        ? "Ubah Data Unit Motor"
                        : "Tambah Unit Motor Baru"}
                    </h2>
                    <span className="px-2 py-0.5 rounded-DEFAULT bg-primary font-label-sm text-label-sm text-primary-fixed uppercase tracking-wider font-semibold">
                      PostgreSQL Sync
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-primary-fixed-dim">
                    Input 100% selaras dengan skema database showroom: tabel{" "}
                    <code className="font-mono bg-primary px-1 rounded">
                      motor
                    </code>{" "}
                    &amp;{" "}
                    <code className="font-mono bg-primary px-1 rounded">
                      foto_motor
                    </code>
                    .
                  </p>
                </div>
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
              {/* SEKSI 1: Spesifikasi Unit (tabel `motor`) */}
              <div className="bg-surface-container-lowest p-space-lg rounded-DEFAULT shadow-sm">
                <div className="flex items-center justify-between pb-space-sm mb-space-md bg-surface-container-low -mx-space-lg -mt-space-lg px-space-lg pt-space-sm rounded-t-DEFAULT">
                  <div className="flex items-center gap-space-xs text-primary font-label-lg text-label-lg font-bold">
                    <span className="material-symbols-outlined text-[20px]">
                      two_wheeler
                    </span>
                    <span>
                      SEKSI 1: Spesifikasi Teknis &amp; Finansial Unit
                    </span>
                  </div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-mono">
                    Tabel: `motor`
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-space-md">
                  {/* Merek */}
                  <div className="md:col-span-3 flex flex-col gap-1">
                    <label className="font-label-sm text-label-sm font-semibold text-on-surface">
                      Merek Pabrikan <span className="text-error">*</span>
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
                      Tipe Lengkap &amp; Varian{" "}
                      <span className="text-error">*</span>
                    </label>
                    <input
                      value={tipe}
                      onChange={(e) => setTipe(e.target.value)}
                      className="w-full px-3 py-2 bg-surface rounded-DEFAULT text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                      placeholder="Misal: Vario 160 CBS / NMAX ABS"
                      required
                      type="text"
                    />
                  </div>

                  {/* Nomor Polisi */}
                  <div className="md:col-span-4 flex flex-col gap-1">
                    <label className="font-label-sm text-label-sm font-semibold text-on-surface">
                      Nomor Polisi (Plat) <span className="text-error">*</span>
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
                      Tahun Pembuatan <span className="text-error">*</span>
                    </label>
                    <input
                      value={tahun}
                      onChange={(e) =>
                        setTahun(parseInt(e.target.value, 10) || 2023)
                      }
                      className="w-full px-3 py-2 bg-surface rounded-DEFAULT text-on-surface font-mono font-semibold text-body-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                      max={2026}
                      min={2005}
                      required
                      type="number"
                    />
                  </div>

                  {/* CC */}
                  <div className="md:col-span-3 flex flex-col gap-1">
                    <label className="font-label-sm text-label-sm font-semibold text-on-surface">
                      Kapasitas Mesin (CC) <span className="text-error">*</span>
                    </label>
                    <input
                      value={cc}
                      onChange={(e) =>
                        setCc(parseInt(e.target.value, 10) || 110)
                      }
                      className="w-full px-3 py-2 bg-surface rounded-DEFAULT text-on-surface font-mono font-semibold text-body-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                      required
                      type="number"
                    />
                  </div>

                  {/* Kilometer */}
                  <div className="md:col-span-3 flex flex-col gap-1">
                    <label className="font-label-sm text-label-sm font-semibold text-on-surface">
                      Kilometer (Odometer) <span className="text-error">*</span>
                    </label>
                    <input
                      value={kilometer}
                      onChange={(e) =>
                        setKilometer(parseInt(e.target.value, 10) || 0)
                      }
                      className="w-full px-3 py-2 bg-surface rounded-DEFAULT text-on-surface font-mono font-semibold text-body-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                      required
                      type="number"
                    />
                  </div>

                  {/* Domisili Samsat */}
                  <div className="md:col-span-3 flex flex-col gap-1">
                    <label className="font-label-sm text-label-sm font-semibold text-on-surface">
                      Domisili Samsat Plat <span className="text-error">*</span>
                    </label>
                    <select
                      value={domisiliSamsat}
                      onChange={(e) => setDomisiliSamsat(e.target.value)}
                      className="w-full px-3 py-2 bg-surface rounded-DEFAULT text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    >
                      <option value="Jakarta Selatan (Plat B)">
                        Jakarta Selatan (Plat B)
                      </option>
                      <option value="Jakarta Timur (Plat B)">
                        Jakarta Timur (Plat B)
                      </option>
                      <option value="Jakarta Barat (Plat B)">
                        Jakarta Barat (Plat B)
                      </option>
                      <option value="Depok (Plat B)">Depok (Plat B)</option>
                      <option value="Bekasi (Plat B)">Bekasi (Plat B)</option>
                      <option value="Tangerang (Plat B)">
                        Tangerang (Plat B)
                      </option>
                      <option value="Bogor (Plat F)">Bogor (Plat F)</option>
                      <option value="Kediri (Plat AG)">Kediri (Plat AG)</option>
                    </select>
                  </div>

                  {/* Kondisi Mesin */}
                  <div className="md:col-span-6 flex flex-col gap-1">
                    <label className="font-label-sm text-label-sm font-semibold text-on-surface">
                      Kondisi Fisik &amp; Suara Mesin{" "}
                      <span className="text-error">*</span>
                    </label>
                    <select
                      value={kondisiMesin}
                      onChange={(e) => setKondisiMesin(e.target.value)}
                      className="w-full px-3 py-2 bg-surface rounded-DEFAULT text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    >
                      <option value="Sangat Baik">
                        Sangat Baik / Halus Kering (Tanpa Rembes Oli)
                      </option>
                      <option value="Baik">
                        Baik (Suara Standar, Tarikan Responsif)
                      </option>
                      <option value="Perlu Servis Ringan">
                        Perlu Servis Ringan (Ganti Oli/Roller CVT)
                      </option>
                    </select>
                  </div>

                  {/* Kelengkapan Dokumen */}
                  <div className="md:col-span-6 flex flex-col gap-1">
                    <label className="font-label-sm text-label-sm font-semibold text-on-surface">
                      Kelengkapan Legalitas Berkas{" "}
                      <span className="text-error">*</span>
                    </label>
                    <select
                      value={kelengkapanDokumen}
                      onChange={(e) => setKelengkapanDokumen(e.target.value)}
                      className="w-full px-3 py-2 bg-surface rounded-DEFAULT text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    >
                      <option value="Lengkap (STNK + BPKB + Faktur)">
                        Lengkap (STNK + BPKB + Faktur Pembelian Asli)
                      </option>
                      <option value="Lengkap (STNK + BPKB)">
                        Lengkap (STNK + BPKB Saja)
                      </option>
                      <option value="Hanya STNK">
                        Hanya STNK (Tanpa BPKB)
                      </option>
                    </select>
                  </div>

                  {/* Harga Beli */}
                  <div className="md:col-span-6 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <label className="font-label-sm text-label-sm font-semibold text-on-surface">
                        Harga Beli Showroom (Modal){" "}
                        <span className="text-error">*</span>
                      </label>
                      <span className="text-on-surface-variant font-label-sm text-label-sm">
                        Akuntansi Internal
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="bg-surface-container text-on-surface-variant px-3 py-2 font-mono font-bold rounded-l-DEFAULT text-[13px] shadow-sm">
                        Rp
                      </span>
                      <input
                        value={hargaBeli}
                        onChange={(e) =>
                          setHargaBeli(parseInt(e.target.value, 10) || 0)
                        }
                        className="w-full px-3 py-2 bg-surface rounded-r-DEFAULT text-on-surface font-mono font-bold text-body-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                        required
                        type="number"
                      />
                    </div>
                  </div>

                  {/* Harga Jual Akhir */}
                  <div className="md:col-span-6 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <label className="font-label-sm text-label-sm font-semibold text-on-surface">
                        Harga Jual Akhir (Listing Retail){" "}
                        <span className="text-error">*</span>
                      </label>
                      <button
                        onClick={handleApplyMLRecommendation}
                        className="inline-flex items-center gap-1 text-[11px] font-label-sm text-primary font-bold hover:underline cursor-pointer"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          auto_graph
                        </span>{" "}
                        Terapkan Rekomendasi ML
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
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md font-bold text-on-surface">
                        Status Ketersediaan Unit
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Tentukan apakah motor langsung tayang di portal pembeli
                        atau diarsipkan sebagai terjual.
                      </span>
                    </div>
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
                        ● Tersedia (Ready Unit)
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
                        Terjual (Sold Out)
                      </button>
                    </div>
                  </div>

                  {/* Deskripsi Tambahan */}
                  <div className="md:col-span-12 flex flex-col gap-1">
                    <label className="font-label-sm text-label-sm font-semibold text-on-surface">
                      Deskripsi Tambahan, Catatan Bodi &amp; Riwayat Servis
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

              {/* SEKSI 2: Area Unggah Berkas Foto Motor (tabel `foto_motor`) */}
              <div className="bg-surface-container-lowest p-space-lg rounded-DEFAULT shadow-sm">
                <div className="flex items-center justify-between pb-space-sm mb-space-md bg-surface-container-low -mx-space-lg -mt-space-lg px-space-lg pt-space-sm rounded-t-DEFAULT">
                  <div className="flex items-center gap-space-xs text-primary font-label-lg text-label-lg font-bold">
                    <span className="material-symbols-outlined text-[20px]">
                      photo_library
                    </span>
                    <span>
                      SEKSI 2: Berkas Foto Fisik Unit Motor (Galeri &amp; Cover)
                    </span>
                  </div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-mono">
                    Tabel: `foto_motor`
                  </span>
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
                    placeholder="Tempel URL Gambar (Opsional, kosongkan untuk gambar studio default)"
                    className="flex-1 px-3 py-2 bg-surface-container-lowest rounded-DEFAULT text-body-sm"
                    type="text"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomPhoto}
                    className="px-4 py-2 bg-primary-container hover:bg-primary text-on-primary rounded-DEFAULT font-label-sm text-label-sm font-semibold cursor-pointer"
                  >
                    + Tambah Slot Foto
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
                            Foto Utama
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
                        <label className="inline-flex items-center gap-1.5 text-on-tertiary-fixed-variant text-[12px] font-bold cursor-pointer">
                          <input
                            checked={photo.is_utama}
                            onChange={() => handleSetMainPhoto(photo.id_foto)}
                            className="accent-tertiary"
                            name="is_utama_radio"
                            type="radio"
                          />
                          <span>
                            {photo.is_utama
                              ? "Foto Utama Aktif (is_utama: 1)"
                              : "Jadikan Foto Utama"}
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
              <div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm">
                <span className="material-symbols-outlined text-outline text-[18px]">
                  info
                </span>
                <span>
                  Semua kolom bertanda{" "}
                  <span className="text-error font-bold">*</span> wajib diisi
                  untuk integritas relasional database PostgreSQL.
                </span>
              </div>
              <div className="flex items-center gap-space-sm w-full sm:w-auto justify-end">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-space-md py-2.5 rounded-DEFAULT bg-surface-container hover:bg-surface-variant text-on-surface font-label-md text-label-md font-semibold transition-colors shadow-sm cursor-pointer"
                  type="button"
                >
                  Batal
                </button>
                <button
                  className="inline-flex items-center gap-space-xs px-space-lg py-2.5 rounded-DEFAULT bg-tertiary-container hover:bg-tertiary text-on-tertiary font-label-md text-label-md font-bold transition-all shadow-md cursor-pointer"
                  type="submit"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    check_circle
                  </span>
                  <span>Simpan Data &amp; Berkas Foto</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
