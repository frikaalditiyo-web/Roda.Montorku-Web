"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { PublicNavbar } from "@/components/PublicNavbar";
import { PublicFooter } from "@/components/PublicFooter";
import { useShowroom } from "@/context/ShowroomContext";
import { formatNumberID, formatRupiah } from "@/data/mockShowroomData";

export default function KatalogMotorPage() {
  const { motors } = useShowroom();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedPriceRange, setSelectedPriceRange] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 6;

  const filteredMotors = useMemo(() => {
    return motors.filter((motor) => {
      const q = searchQuery.trim().toLowerCase();
      const matchQuery =
        !q ||
        `${motor.merek} ${motor.tipe}`.toLowerCase().includes(q) ||
        motor.domisili_samsat.toLowerCase().includes(q) ||
        motor.nopol.toLowerCase().includes(q);

      const matchBrand =
        !selectedBrand ||
        motor.merek.toLowerCase() === selectedBrand.toLowerCase();

      let matchYear = true;
      if (selectedYear === "<2020") {
        matchYear = motor.tahun < 2020;
      } else if (selectedYear) {
        matchYear = String(motor.tahun) === selectedYear;
      }

      let matchPrice = true;
      if (selectedPriceRange === "low") {
        matchPrice = motor.harga_jual < 15000000;
      } else if (selectedPriceRange === "mid") {
        matchPrice =
          motor.harga_jual >= 15000000 && motor.harga_jual <= 25000000;
      } else if (selectedPriceRange === "high") {
        matchPrice = motor.harga_jual > 25000000;
      }

      return matchQuery && matchBrand && matchYear && matchPrice;
    });
  }, [motors, searchQuery, selectedBrand, selectedYear, selectedPriceRange]);

  const totalPages = Math.max(1, Math.ceil(filteredMotors.length / itemsPerPage));
  const paginatedMotors = filteredMotors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedBrand("");
    setSelectedYear("");
    setSelectedPriceRange("");
    setCurrentPage(1);
  };

  const hasActiveFilter =
    Boolean(searchQuery) ||
    Boolean(selectedBrand) ||
    Boolean(selectedYear) ||
    Boolean(selectedPriceRange);

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <PublicNavbar />

      <main className="w-full pt-16 bg-surface flex-1">
        <div className="flex flex-col w-full">
          <div className="max-w-7xl mx-auto w-full px-margin-mobile md:px-margin py-space-lg flex flex-col gap-space-lg">
            {/* Hero Banner */}
            <div className="w-full bg-secondary-container rounded-xl p-6 md:p-8 flex flex-col items-center justify-center text-center shadow-sm gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest/90 text-primary font-label-sm text-label-sm uppercase tracking-wider shadow-xs">
                <span className="w-2 h-2 rounded-full bg-on-tertiary-container animate-pulse"></span>
                E-Katalog Resmi Showroom UMKM Roda.Motorku
              </span>
              <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary-container font-bold tracking-tight">
                Temukan motor bekas berkualitas dengan informasi lengkap
              </h1>
              <p className="font-body-md text-body-md text-on-secondary-container max-w-2xl">
                Seluruh unit telah terinspeksi 120+ titik kelayakan mesin, surat
                STNK &amp; BPKB terverifikasi, serta harga transparan berbasis
                evaluasi pasar Machine Learning.
              </p>
            </div>

            {/* Baris Pencarian & Filter (Single Row Sejajar sesuai Desain) */}
            <div
              id="katalog-unit"
              className="w-full bg-surface-container-lowest p-space-md rounded-xl shadow-sm"
            >
              <form
                className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  setCurrentPage(1);
                }}
              >
                {/* Input Pencarian Teks Lebar */}
                <div className="relative flex-grow flex items-center min-w-0">
                  <span className="material-symbols-outlined absolute left-3 text-secondary text-[20px] pointer-events-none select-none">
                    search
                  </span>
                  <input
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface placeholder:text-secondary focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container transition-all"
                    placeholder="Cari merek / tipe motor / plat domisili..."
                    type="text"
                  />
                </div>

                {/* Filter Dropdown 1: Merek */}
                <div className="relative min-w-[140px] flex-shrink-0">
                  <select
                    value={selectedBrand}
                    onChange={(e) => {
                      setSelectedBrand(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full appearance-none pl-3 pr-8 py-2.5 bg-surface-container-low rounded-lg font-label-md text-label-md text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container transition-all cursor-pointer"
                  >
                    <option value="">Semua Merek</option>
                    <option value="Honda">Honda</option>
                    <option value="Yamaha">Yamaha</option>
                    <option value="Suzuki">Suzuki</option>
                    <option value="Kawasaki">Kawasaki</option>
                    <option value="Vespa">Vespa</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary text-[18px] pointer-events-none">
                    expand_more
                  </span>
                </div>

                {/* Filter Dropdown 2: Tahun */}
                <div className="relative min-w-[130px] flex-shrink-0">
                  <select
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full appearance-none pl-3 pr-8 py-2.5 bg-surface-container-low rounded-lg font-label-md text-label-md text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container transition-all cursor-pointer"
                  >
                    <option value="">Semua Tahun</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                    <option value="2021">2021</option>
                    <option value="2020">2020</option>
                    <option value="<2020">&lt; 2020</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary text-[18px] pointer-events-none">
                    expand_more
                  </span>
                </div>

                {/* Filter Dropdown 3: Harga */}
                <div className="relative min-w-[165px] flex-shrink-0">
                  <select
                    value={selectedPriceRange}
                    onChange={(e) => {
                      setSelectedPriceRange(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full appearance-none pl-3 pr-8 py-2.5 bg-surface-container-low rounded-lg font-label-md text-label-md text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container transition-all cursor-pointer"
                  >
                    <option value="">Semua Harga</option>
                    <option value="low">&lt; Rp 15 Juta</option>
                    <option value="mid">Rp 15 - 25 Juta</option>
                    <option value="high">&gt; Rp 25 Juta</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary text-[18px] pointer-events-none">
                    expand_more
                  </span>
                </div>

                {/* Tombol Cari & Reset */}
                <div className="flex items-center gap-2">
                  <button
                    className="flex-1 lg:flex-initial flex items-center justify-center gap-space-xs px-6 py-2.5 bg-primary-container hover:bg-primary text-on-primary font-label-lg text-label-lg rounded-lg shadow-sm transition-colors flex-shrink-0 cursor-pointer"
                    type="submit"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      search
                    </span>
                    <span>Cari</span>
                  </button>
                  {hasActiveFilter && (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="px-3 py-2.5 bg-surface-container hover:bg-surface-variant text-secondary font-label-md text-label-md rounded-lg transition-colors cursor-pointer"
                      title="Reset Filter"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Status & Counter Unit */}
            <div className="flex items-center justify-between px-1">
              <p className="font-body-sm text-body-sm text-secondary">
                Menampilkan{" "}
                <span className="font-semibold text-on-surface">
                  {paginatedMotors.length}
                </span>{" "}
                dari{" "}
                <span className="font-semibold text-on-surface">
                  {filteredMotors.length}
                </span>{" "}
                unit motor sesuai filter (Total {motors.length} unit terdaftar)
              </p>
              <div className="hidden sm:flex items-center gap-space-xs text-secondary font-label-sm text-label-sm">
                <span className="w-2 h-2 rounded-full bg-on-tertiary-container inline-block"></span>
                <span>Semua Unit Telah Lolos Cek Fisik &amp; Dokumen</span>
              </div>
            </div>

            {/* Grid Daftar Motor (3 Kolom Desktop) */}
            {paginatedMotors.length === 0 ? (
              <div className="bg-surface-container-lowest rounded-xl p-space-xl text-center shadow-sm flex flex-col items-center gap-space-sm">
                <span className="material-symbols-outlined text-[48px] text-outline">
                  search_off
                </span>
                <h2 className="font-headline-sm text-headline-sm text-primary font-bold">
                  Unit Motor Tidak Ditemukan
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
                  Tidak ada motor yang cocok dengan kriteria pencarian atau
                  filter Anda. Silakan ubah kata kunci atau reset filter.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-2 px-5 py-2.5 bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md rounded-lg shadow-sm transition-colors"
                >
                  Tampilkan Semua Motor
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
                {paginatedMotors.map((motor) => {
                  const mainPhoto =
                    motor.foto_motor.find((f) => f.is_utama)?.nama_file ||
                    motor.foto_motor[0]?.nama_file;
                  const isAvailable = motor.status === "Tersedia";

                  return (
                    <div
                      key={motor.id_motor}
                      className="group bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between border border-surface-container"
                    >
                      <div>
                        {/* Foto Motor & Badge */}
                        <div className="relative w-full aspect-[16/10] bg-surface-container-low overflow-hidden">
                          <img
                            alt={`${motor.merek} ${motor.tipe} ${motor.tahun}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            src={mainPhoto}
                          />
                          <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm shadow-sm">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isAvailable
                                  ? "bg-on-tertiary-container"
                                  : "bg-secondary"
                              }`}
                            ></span>
                            <span
                              className={`font-label-sm text-label-sm uppercase tracking-wider ${
                                isAvailable
                                  ? "text-on-tertiary-container"
                                  : "text-secondary"
                              }`}
                            >
                              {motor.status}
                            </span>
                          </div>
                          <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-inverse-surface/80 text-inverse-on-surface font-label-sm text-label-sm">
                            {motor.domisili_samsat}
                          </div>
                        </div>

                        {/* Konten Info */}
                        <div className="p-5 flex flex-col gap-1.5">
                          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold truncate">
                            {motor.merek} {motor.tipe}
                          </h2>
                          <p className="font-body-sm text-body-sm text-secondary tabular-nums">
                            {motor.tahun} · {formatNumberID(motor.kilometer)} km
                            · {motor.cc} cc
                          </p>
                          <div className="flex items-center gap-1.5 mt-1 text-on-surface-variant font-label-sm text-label-sm">
                            <span className="px-2 py-0.5 rounded bg-surface-container-low">
                              Mesin: {motor.kondisi_mesin}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-surface-container-low truncate">
                              {motor.kelengkapan_dokumen.split("(")[0].trim()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Footer Kartu: Harga & Aksi */}
                      <div className="p-5 pt-0 mt-2 flex items-center justify-between gap-3">
                        <div className="flex flex-col">
                          <span className="font-label-sm text-label-sm text-secondary uppercase">
                            Harga Tunai
                          </span>
                          <span className="font-currency-stat text-currency-stat text-primary-container font-bold tabular-nums">
                            {formatRupiah(motor.harga_jual)}
                          </span>
                        </div>
                        <Link
                          href={`/katalog/${motor.id_motor}`}
                          className="px-5 py-2.5 bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md rounded-lg shadow-sm transition-colors text-center cursor-pointer inline-flex items-center justify-center"
                        >
                          Detail
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination & Navigasi Halaman */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-space-md pb-space-lg">
              <span className="font-body-sm text-body-sm text-secondary">
                Halaman {currentPage} dari {totalPages} (Total{" "}
                {filteredMotors.length} Unit Ditampilkan)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    chevron_left
                  </span>
                </button>
                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
                  (page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={
                        currentPage === page
                          ? "w-10 h-10 flex items-center justify-center rounded-lg bg-primary-container text-on-primary font-label-md text-label-md shadow-sm"
                          : "w-10 h-10 flex items-center justify-center rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-md text-label-md transition-colors"
                      }
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    chevron_right
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
