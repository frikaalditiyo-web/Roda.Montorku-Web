"use client";

import React from "react";
import Link from "next/link";
import { useShowroom } from "@/context/ShowroomContext";
import { formatNumberID, formatRupiah } from "@/data/mockShowroomData";

export default function AdminDashboardPage() {
  const { motors, predictions, deleteMotor } = useShowroom();

  const totalUnits = motors.length;
  const availableUnits = motors.filter((m) => m.status === "Tersedia").length;
  const soldUnits = motors.filter((m) => m.status === "Terjual").length;
  const availablePct =
    totalUnits > 0 ? Math.round((availableUnits / totalUnits) * 100) : 0;

  const totalInventoryValue = motors.reduce(
    (sum, m) => sum + m.harga_jual,
    0
  );

  const recentMotors = motors.slice(0, 5);
  const recentPredictions = predictions.slice(0, 3);

  return (
    <div className="flex flex-col w-full">
      {/* Top Welcome & Operational Status Bar */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md mb-space-lg">
        <div className="flex flex-col">
          <div className="flex items-center gap-space-xs mb-space-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-DEFAULT bg-secondary-container text-on-primary-fixed-variant font-label-sm text-label-sm font-semibold tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              KONSOL UTAMA SHOWROOM
            </span>
            <span className="text-outline-variant">•</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">
                calendar_today
              </span>
              Update Terkini: 2026
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">
            Dashboard
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
            Selamat datang kembali,{" "}
            <strong className="text-on-surface font-semibold">
              Admin Showroom Otista
            </strong>
            . Pantau performa stok motor dan aktivitas estimasi harga Machine
            Learning.
          </p>
        </div>

        {/* Quick Status Badge */}
        <div className="flex items-center gap-space-sm bg-surface-container-lowest px-space-md py-2.5 rounded-xl shadow-sm self-start lg:self-auto">
          <div className="w-2.5 h-2.5 rounded-full bg-tertiary-container ring-4 ring-tertiary-fixed"></div>
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              Konektivitas Mesin Valuasi
            </span>
            <span className="font-label-md text-label-md text-primary font-semibold">
              Database PostgreSQL &amp; API Flask Aktif
            </span>
          </div>
        </div>
      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md mb-space-xl">
        {/* Card 1: Total Motor */}
        <div className="bg-secondary-container/70 rounded-xl p-space-lg flex flex-col justify-between shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-primary/5 rounded-full pointer-events-none group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-primary-fixed-variant uppercase tracking-wider font-semibold">
              Total Motor
            </span>
            <div className="w-9 h-9 rounded-DEFAULT bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">
                two_wheeler
              </span>
            </div>
          </div>
          <div className="mt-space-md flex flex-col">
            <div className="flex items-baseline gap-space-xs">
              <span className="font-display-lg text-display-lg text-primary font-bold tabular-nums">
                {totalUnits}
              </span>
              <span className="font-label-md text-label-md text-on-surface-variant font-medium">
                unit motor
              </span>
            </div>
            <div className="mt-space-xs flex items-center gap-1 font-label-sm text-label-sm text-on-primary-fixed-variant">
              <span className="material-symbols-outlined text-[15px] text-tertiary">
                trending_up
              </span>
              <span className="font-semibold text-tertiary">+3 unit</span>
              <span className="text-on-surface-variant">
                minggu ini di inventaris
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Motor Tersedia */}
        <div className="bg-secondary-container/70 rounded-xl p-space-lg flex flex-col justify-between shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-tertiary/5 rounded-full pointer-events-none group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-primary-fixed-variant uppercase tracking-wider font-semibold">
              Motor Tersedia
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-DEFAULT bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-sm text-label-sm font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
              Ready Stok
            </span>
          </div>
          <div className="mt-space-md flex flex-col">
            <div className="flex items-baseline gap-space-xs">
              <span className="font-display-lg text-display-lg text-primary font-bold tabular-nums">
                {availableUnits}
              </span>
              <span className="font-label-md text-label-md text-on-surface-variant font-medium">
                unit motor siap jual
              </span>
            </div>
            <div className="mt-space-xs flex items-center gap-2">
              <div className="w-24 h-1.5 bg-surface-container rounded-full overflow-hidden">
                <div
                  className="h-full bg-tertiary-container rounded-full"
                  style={{ width: `${availablePct}%` }}
                ></div>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                {availablePct}% kapasitas display
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Motor Terjual */}
        <div className="bg-secondary-container/70 rounded-xl p-space-lg flex flex-col justify-between shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-primary/5 rounded-full pointer-events-none group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-primary-fixed-variant uppercase tracking-wider font-semibold">
              Motor Terjual
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-DEFAULT bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-label-sm font-bold">
              Closed Deal
            </span>
          </div>
          <div className="mt-space-md flex flex-col">
            <div className="flex items-baseline gap-space-xs">
              <span className="font-display-lg text-display-lg text-primary font-bold tabular-nums">
                {soldUnits}
              </span>
              <span className="font-label-md text-label-md text-on-surface-variant font-medium">
                unit laku
              </span>
            </div>
            <div className="mt-space-xs flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-[15px] text-primary">
                sell
              </span>
              <span>Performa berjalan: </span>
              <span className="font-semibold text-on-surface">Tahun 2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action & Model Health Banner */}
      <div className="bg-surface-container-lowest rounded-xl p-space-lg mb-space-xl shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
        <div className="flex flex-col sm:flex-row sm:items-center gap-space-md">
          <Link
            className="inline-flex items-center justify-center gap-space-xs px-space-lg py-2.5 bg-primary text-on-primary font-label-md text-label-md font-semibold rounded-DEFAULT hover:bg-primary-container transition-colors shadow-sm"
            href="/admin/data-motor"
          >
            <span className="material-symbols-outlined text-[18px]">
              add_circle
            </span>
            <span>+ Tambah Unit Motor Baru</span>
          </Link>
          <Link
            className="inline-flex items-center justify-center gap-space-xs px-space-lg py-2.5 bg-secondary-container text-primary font-label-md text-label-md font-semibold rounded-DEFAULT hover:bg-secondary-fixed transition-colors"
            href="/admin/estimasi"
          >
            <span className="material-symbols-outlined text-[18px] text-primary">
              bolt
            </span>
            <span>⚡ Cek Estimasi Harga ML</span>
          </Link>
        </div>

        {/* ML Performance Indicator Badge */}
        <div className="flex items-center gap-space-md pt-space-xs lg:pt-0">
          <div className="flex items-center gap-space-xs">
            <div className="w-8 h-8 rounded-full bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed-variant">
              <span className="material-symbols-outlined text-[18px]">
                precision_manufacturing
              </span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Engine ML Otista
                </span>
                <span className="text-outline-variant">•</span>
                <span className="font-label-sm text-label-sm font-bold text-tertiary-container">
                  R² Score 94.6%
                </span>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Random Forest Regressor (Best of 3 Models: LR, DT, RF)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Recent Motors Table + Sidebar ML History */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-xl items-start">
        {/* Left 8 Cols: Data Motor Terbaru Table */}
        <div className="xl:col-span-8 flex flex-col bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
          <div className="px-space-lg py-space-md flex items-center justify-between bg-surface-container-lowest">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary text-[22px]">
                inventory_2
              </span>
              <h2 className="font-headline-sm text-headline-sm text-primary font-bold">
                Data motor terbaru
              </h2>
            </div>
            <Link
              className="inline-flex items-center gap-1 text-primary hover:text-primary-container font-label-md text-label-md font-semibold transition-colors"
              href="/admin/data-motor"
            >
              <span>Lihat Semua ({totalUnits})</span>
              <span className="material-symbols-outlined text-[16px]">
                arrow_forward
              </span>
            </Link>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md uppercase tracking-wider">
                  <th className="py-3 px-space-lg font-bold">Merek / Tipe</th>
                  <th className="py-3 px-space-md font-bold">Tahun</th>
                  <th className="py-3 px-space-md font-bold">Harga Jual</th>
                  <th className="py-3 px-space-md font-bold">Status</th>
                  <th className="py-3 px-space-lg font-bold text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="font-body-md text-body-md divide-y-0">
                {recentMotors.map((motor) => {
                  const thumb =
                    motor.foto_motor.find((f) => f.is_utama)?.nama_file ||
                    motor.foto_motor[0]?.nama_file;
                  const isAvailable = motor.status === "Tersedia";

                  return (
                    <tr
                      key={motor.id_motor}
                      className="hover:bg-surface-container-low/70 transition-colors group"
                    >
                      <td className="py-3 px-space-lg">
                        <div className="flex items-center gap-space-sm">
                          <img
                            alt={`${motor.merek} ${motor.tipe}`}
                            className="w-12 h-9 object-cover rounded-DEFAULT bg-surface-container shadow-xs shrink-0"
                            src={thumb}
                          />
                          <div className="flex flex-col min-w-0">
                            <Link
                              href={`/katalog/${motor.id_motor}`}
                              className="font-label-md text-label-md font-bold text-on-surface group-hover:text-primary transition-colors truncate"
                            >
                              {motor.merek} {motor.tipe}
                            </Link>
                            <span className="font-label-sm text-label-sm text-on-surface-variant font-mono">
                              {motor.nopol} • Odo{" "}
                              {formatNumberID(motor.kilometer)} km
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-space-md font-medium text-on-surface">
                        {motor.tahun}
                      </td>
                      <td className="py-3 px-space-md">
                        <span className="font-currency-stat text-currency-stat text-primary font-bold tabular-nums">
                          {formatRupiah(motor.harga_jual)}
                        </span>
                      </td>
                      <td className="py-3 px-space-md">
                        {isAvailable ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-sm text-label-sm font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                            Tersedia
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-variant text-on-surface-variant font-label-sm text-label-sm font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                            Terjual
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-space-lg text-right font-label-md text-label-md whitespace-nowrap">
                        <Link
                          href="/admin/data-motor"
                          className="text-primary hover:text-primary-container font-semibold transition-colors"
                        >
                          Ubah
                        </Link>
                        <span className="text-outline-variant mx-1.5">|</span>
                        <button
                          type="button"
                          onClick={() => deleteMotor(motor.id_motor)}
                          className="text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-space-lg py-3 bg-surface-container-low/50 flex flex-col sm:flex-row items-center justify-between gap-space-xs font-body-sm text-body-sm text-on-surface-variant">
            <span>
              Menampilkan {recentMotors.length} dari total {totalUnits}{" "}
              inventaris showroom aktif
            </span>
            <div className="flex items-center gap-space-xs font-label-sm text-label-sm">
              <span className="w-2 h-2 rounded-full bg-tertiary"></span>
              <span>Status filter: Semua Unit</span>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Riwayat Prediksi ML Terakhir + Visual Card */}
        <div className="xl:col-span-4 flex flex-col gap-space-md">
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col">
            <div className="flex items-center justify-between pb-space-sm mb-space-sm">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  history_edu
                </span>
                <h3 className="font-headline-sm text-headline-sm text-primary font-bold">
                  Riwayat Prediksi ML
                </h3>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-DEFAULT bg-primary/10 text-primary font-label-sm text-label-sm font-bold">
                POST /predict
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
              Aktivitas inferensi terkini oleh kalkulator valuasi harga motor
              bekas:
            </p>

            <div className="flex flex-col gap-space-sm">
              {recentPredictions.map((pred) => (
                <div
                  key={pred.id_prediksi}
                  className="p-space-sm bg-surface-container-low rounded-DEFAULT flex flex-col gap-1 hover:bg-surface-container transition-colors"
                >
                  <div className="flex items-start justify-between gap-space-xs">
                    <span className="font-label-md text-label-md font-semibold text-on-surface truncate">
                      {pred.nama_motor_katalog ||
                        `${pred.fitur_masukan.merek} (${pred.fitur_masukan.tahun})`}
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap">
                      {pred.waktu_relatif}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Odo {formatNumberID(pred.fitur_masukan.kilometer)} km •{" "}
                      {pred.fitur_masukan.kondisi_mesin}
                    </span>
                    <span className="font-label-md text-label-md font-bold text-primary tabular-nums">
                      {formatRupiah(pred.harga_estimasi)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 font-label-sm text-label-sm text-tertiary font-medium">
                    <span className="material-symbols-outlined text-[14px]">
                      verified
                    </span>
                    <span>
                      {pred.nama_model} (R² {pred.akurasi_r2}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <Link
              className="mt-space-md py-2 text-center text-primary font-label-md text-label-md font-semibold bg-secondary-container hover:bg-secondary-fixed rounded-DEFAULT transition-colors"
              href="/admin/riwayat-estimasi"
            >
              Buka Riwayat Valuasi Lengkap
            </Link>
          </div>

          {/* Quick Showroom Insight Card */}
          <div className="bg-primary text-on-primary rounded-xl p-space-lg shadow-sm relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary-fixed/10 rounded-full pointer-events-none"></div>
            <div className="flex items-center justify-between mb-space-xs">
              <span className="font-label-sm text-label-sm text-primary-fixed-dim uppercase tracking-wider font-semibold">
                Statistik Valuasi Showroom
              </span>
              <span className="material-symbols-outlined text-primary-fixed-dim text-[18px]">
                analytics
              </span>
            </div>
            <div className="font-headline-sm text-headline-sm font-bold text-on-primary mb-space-xs tabular-nums">
              {formatRupiah(totalInventoryValue)}
            </div>
            <p className="font-body-sm text-body-sm text-primary-fixed-dim mb-space-md">
              Total nilai pasar dari {totalUnits} unit motor yang terdaftar di
              basis data showroom Roda.Motorku.
            </p>
            <div className="flex flex-col gap-1.5 pt-space-xs">
              <div className="flex justify-between font-label-sm text-label-sm">
                <span className="text-primary-fixed-dim">
                  Ketersediaan Stok Aktif ({availableUnits}/{totalUnits})
                </span>
                <span className="font-bold text-on-primary">
                  {availablePct}%
                </span>
              </div>
              <div className="w-full h-2 bg-primary-container rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-fixed rounded-full"
                  style={{ width: `${availablePct}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
