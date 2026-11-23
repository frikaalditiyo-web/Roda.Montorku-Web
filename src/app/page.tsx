"use client";

import React, { useState, useMemo, useEffect } from "react";
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
  const [navigatingMotorId, setNavigatingMotorId] = useState<number | null>(null);

  const itemsPerPage = 6;
  const brands = useMemo(() => [...new Set(motors.map((motor) => motor.merek))].sort(), [motors]);
  const years = useMemo(() => [...new Set(motors.map((motor) => motor.tahun))].sort((a, b) => b - a), [motors]);
  const prices = useMemo(() => [...new Set(motors.map((motor) => motor.harga_jual))].sort((a, b) => a - b), [motors]);
  const priceCuts = useMemo(() => [
    prices[Math.floor((prices.length - 1) / 3)] ?? 0,
    prices[Math.floor(((prices.length - 1) * 2) / 3)] ?? 0,
  ], [prices]);

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

      const matchYear = !selectedYear || String(motor.tahun) === selectedYear;
      const matchPrice =
        !selectedPriceRange ||
        (selectedPriceRange === "low" && motor.harga_jual <= priceCuts[0]) ||
        (selectedPriceRange === "mid" && motor.harga_jual > priceCuts[0] && motor.harga_jual <= priceCuts[1]) ||
        (selectedPriceRange === "high" && motor.harga_jual > priceCuts[1]);

      return matchQuery && matchBrand && matchYear && matchPrice;
    });
  }, [motors, searchQuery, selectedBrand, selectedYear, selectedPriceRange, priceCuts]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredMotors.length / itemsPerPage)
  );
  const paginatedMotors = filteredMotors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const pageBlockStart = Math.floor((currentPage - 1) / 10) * 10 + 1;
  const pageBlockEnd = Math.min(pageBlockStart + 9, totalPages);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  // Reset loading state tombol detail saat halaman katalog aktif/kembali dari detail
  useEffect(() => {
    setNavigatingMotorId(null);

    const handlePageShow = () => {
      setNavigatingMotorId(null);
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    document.getElementById("katalog-unit")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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

      <main className="w-full bg-surface flex-1">
        {/* Full-bleed Hero Section */}
        <section
          className="hero-showroom hero-showroom--fullbleed"
          role="img"
          aria-label="Showroom motor bekas Roda.Motorku dengan deretan unit motor"
        >
          {/* Ornamen dekoratif: aksen diagonal, glow biru, garis geometris */}
          <span className="hero-showroom__diagonal" aria-hidden="true"></span>
          <span className="hero-showroom__glow" aria-hidden="true"></span>
          <span className="hero-showroom__lines" aria-hidden="true"></span>

          {/* Banner Content Container (align dengan max-w-7xl navbar & konten) */}
          <div className="max-w-7xl mx-auto w-full px-margin-mobile md:px-margin">
            <div className="hero-showroom__content">
              <span className="hero-showroom__badge">
                <span className="hero-showroom__badge-dot"></span>
                Katalog Resmi Roda.Motorku
              </span>
              <h1 className="hero-showroom__title">
                Pilihan Motor Bekas{" "}
                <span className="hero-showroom__title-accent">Berkualitas &amp; Bergaransi</span>
              </h1>
              <p className="hero-showroom__subtitle">
                Unit terinspeksi menyeluruh, dokumen lengkap, dan harga
                transparan.
              </p>
            </div>
          </div>
        </section>

        <div className="flex flex-col w-full">
          <div className="max-w-7xl mx-auto w-full px-margin-mobile md:px-margin py-space-lg flex flex-col gap-space-lg">
            {/* Baris Pencarian & Filter */}
            <div
              id="katalog-unit"
              className="w-full bg-surface-container-lowest p-space-md rounded-xl shadow-sm scroll-mt-20"
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
                  <span className="material-symbols-outlined absolute left-3 text-primary text-[20px] pointer-events-none select-none">
                    search
                  </span>
                  <input
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface placeholder:text-primary focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container transition-all"
                    placeholder="Cari merek atau tipe motor..."
                    type="text"
                  />
                </div>

                {/* Filter Dropdown 1: Merek */}
                <div className="relative w-full lg:w-auto lg:min-w-[140px] flex-shrink-0">
                  <select
                    value={selectedBrand}
                    onChange={(e) => {
                      setSelectedBrand(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full appearance-none pl-3 pr-8 py-2.5 bg-surface-container-low rounded-lg font-label-md text-label-md text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container transition-all cursor-pointer"
                  >
                    <option value="">Semua Merek</option>
                    {brands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-primary text-[18px] pointer-events-none">
                    expand_more
                  </span>
                </div>

                {/* Filter Dropdown 2: Tahun */}
                <div className="relative w-full lg:w-auto lg:min-w-[130px] flex-shrink-0">
                  <select
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full appearance-none pl-3 pr-8 py-2.5 bg-surface-container-low rounded-lg font-label-md text-label-md text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container transition-all cursor-pointer"
                  >
                    <option value="">Semua Tahun</option>
                    {years.map((year) => <option key={year} value={year}>{year}</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-primary text-[18px] pointer-events-none">
                    expand_more
                  </span>
                </div>

                {/* Filter Dropdown 3: Harga */}
                <div className="relative w-full lg:w-auto lg:min-w-[165px] flex-shrink-0">
                  <select
                    value={selectedPriceRange}
                    onChange={(e) => {
                      setSelectedPriceRange(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full appearance-none pl-3 pr-8 py-2.5 bg-surface-container-low rounded-lg font-label-md text-label-md text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container transition-all cursor-pointer"
                  >
                    <option value="">Semua Harga</option>
                    <option value="low">Harga rendah (≤ {formatRupiah(priceCuts[0])})</option>
                    <option value="mid">Harga menengah</option>
                    <option value="high">Harga tinggi (&gt; {formatRupiah(priceCuts[1])})</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-primary text-[18px] pointer-events-none">
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
                      className="px-3 py-2.5 bg-surface-container hover:bg-surface-variant text-primary font-label-md text-label-md rounded-lg transition-colors cursor-pointer"
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
              <p className="font-body-sm text-body-sm text-primary">
                Menampilkan{" "}
                <span className="font-semibold text-on-surface">
                  {paginatedMotors.length}
                </span>{" "}
                dari{" "}
                <span className="font-semibold text-on-surface">
                  {filteredMotors.length}
                </span>{" "}
                unit motor
              </p>
            </div>

            {/* Grid Daftar Motor */}
            {paginatedMotors.length === 0 ? (
              <div className="bg-surface-container-lowest rounded-xl p-space-xl text-center shadow-sm flex flex-col items-center gap-space-sm">
                <span className="material-symbols-outlined text-[48px] text-outline">
                  search_off
                </span>
                <h2 className="font-headline-sm text-headline-sm text-primary font-bold">
                  Unit Motor Tidak Ditemukan
                </h2>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-2 px-5 py-2.5 bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md rounded-lg shadow-sm transition-colors"
                >
                  Tampilkan Semua Motor
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-gutter">
                {paginatedMotors.map((motor) => {
                  const mainPhoto =
                    motor.foto_motor.find((f) => f.is_utama)?.nama_file ||
                    motor.foto_motor[0]?.nama_file;
                  const isAvailable = motor.status === "Tersedia";

                  return (
                    <div
                      key={motor.id_motor}
                      className="group bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between border border-surface-container/80"
                    >
                      <div>
                        {/* Foto Motor & Badge */}
                        <div className="relative w-full aspect-[16/10] bg-surface-container-low overflow-hidden">
                          <img
                            alt={`${motor.merek} ${motor.tipe} ${motor.tahun}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            src={mainPhoto}
                            loading="lazy"
                          />
                          <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm shadow-xs">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isAvailable
                                  ? "bg-primary"
                                  : "bg-secondary"
                              }`}
                            ></span>
                            <span
                              className="font-label-sm text-[11px] font-bold uppercase tracking-wider text-primary"
                            >
                              {motor.status}
                            </span>
                          </div>
                        </div>

                        {/* Konten Info */}
                        <div className="p-3.5 sm:p-5 flex flex-col gap-1">
                          <h2 className="text-base sm:text-headline-sm text-on-surface font-bold leading-tight line-clamp-1">
                            {motor.merek} {motor.tipe}
                          </h2>
                          <p className="text-xs sm:text-body-sm text-primary/80 tabular-nums">
                            {motor.tahun} · {formatNumberID(motor.kilometer)} km · {motor.cc} cc
                          </p>
                        </div>
                      </div>

                      {/* Footer Kartu: Harga & Aksi */}
                      <div className="p-3.5 sm:p-5 pt-0 mt-0.5 flex items-center justify-between gap-2 border-t border-surface-container/40 pt-3">
                        <div className="flex flex-col min-w-0">
                          <span className="text-[10px] text-primary/60 uppercase font-semibold tracking-wider">
                            Harga Jual
                          </span>
                          <span className="text-base sm:text-currency-stat text-primary font-bold tabular-nums truncate">
                            {formatRupiah(motor.harga_jual)}
                          </span>
                        </div>
                        <Link
                          href={`/katalog/${motor.id_motor}`}
                          onClick={() => setNavigatingMotorId(motor.id_motor)}
                          className="px-3.5 sm:px-5 py-2 sm:py-2.5 bg-primary-container hover:bg-primary text-on-primary font-label-md text-xs sm:text-label-md rounded-lg shadow-xs transition-all text-center cursor-pointer inline-flex items-center justify-center gap-1.5 flex-shrink-0"
                        >
                          {navigatingMotorId === motor.id_motor ? (
                            <>
                              <span className="w-3.5 h-3.5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin"></span>
                              <span>Memuat...</span>
                            </>
                          ) : (
                            <span>Lihat Detail</span>
                          )}
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination & Navigasi Halaman */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-space-sm pb-space-lg">
              <span className="font-body-sm text-xs sm:text-body-sm text-primary order-2 sm:order-1">
                Halaman {currentPage} dari {totalPages}
              </span>
              <div className="flex items-center gap-1.5 sm:gap-2 order-1 sm:order-2 overflow-x-auto max-w-full py-1">
                <button
                  type="button"
                  onClick={() => goToPage(Math.max(1, pageBlockStart - 1))}
                  disabled={pageBlockStart === 1}
                  className="w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 flex items-center justify-center rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs"
                >
                  <span className="material-symbols-outlined text-[18px] sm:text-[20px]">
                    chevron_left
                  </span>
                </button>
                {Array.from({ length: Math.max(0, pageBlockEnd - pageBlockStart + 1) }, (_, idx) => pageBlockStart + idx).map(
                  (page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => goToPage(page)}
                      className={
                        currentPage === page
                          ? "w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 flex items-center justify-center rounded-lg bg-primary-container text-on-primary font-label-md text-xs sm:text-label-md shadow-xs font-bold"
                          : "w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 flex items-center justify-center rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-md text-xs sm:text-label-md transition-colors shadow-xs"
                      }
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  type="button"
                  onClick={() =>
                    goToPage(Math.min(totalPages, pageBlockEnd + 1))
                  }
                  disabled={pageBlockEnd === totalPages}
                  className="w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 flex items-center justify-center rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs"
                >
                  <span className="material-symbols-outlined text-[18px] sm:text-[20px]">
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
