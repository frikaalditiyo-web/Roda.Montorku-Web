"use client";

import React from "react";
import Link from "next/link";
import { useShowroom } from "@/context/ShowroomContext";
import { formatNumberID, formatRupiah, Motor } from "@/data/mockShowroomData";

export default function AdminDashboardPage() {
  const { motors, predictions, deleteMotor } = useShowroom();

  const [deletingMotor, setDeletingMotor] = React.useState<Motor | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

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
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">
            Dashboard
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
            Ringkasan stok motor dan aktivitas estimasi harga showroom.
          </p>
        </div>

        {/* Quick Status Badge */}
        <div className="flex items-center gap-space-sm bg-surface-container-lowest px-space-md py-2 rounded-xl border border-outline-variant/60 shadow-sm self-start lg:self-auto">
          <div className="w-2 h-2 rounded-full bg-tertiary-container ring-4 ring-tertiary-fixed"></div>
          <span className="font-label-md text-label-md text-primary font-semibold">
            Sistem Valuasi Aktif
          </span>
        </div>
      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md mb-space-xl">
        {/* Card 1: Total Motor */}
        <div className="bg-surface-container-lowest rounded-xl p-space-lg flex flex-col justify-between border border-outline-variant/60 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
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
                unit
              </span>
            </div>
            <div className="mt-space-xs flex items-center gap-1 font-label-sm text-label-sm text-on-primary-fixed-variant">
              <span className="font-semibold text-tertiary">+3 unit</span>
              <span className="text-on-surface-variant">minggu ini</span>
            </div>
          </div>
        </div>

        {/* Card 2: Motor Tersedia */}
        <div className="bg-surface-container-lowest rounded-xl p-space-lg flex flex-col justify-between border border-outline-variant/60 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-tertiary/5 rounded-full pointer-events-none group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-primary-fixed-variant uppercase tracking-wider font-semibold">
              Motor Tersedia
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-DEFAULT bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-sm text-label-sm font-bold">
              Ready
            </span>
          </div>
          <div className="mt-space-md flex flex-col">
            <div className="flex items-baseline gap-space-xs">
              <span className="font-display-lg text-display-lg text-primary font-bold tabular-nums">
                {availableUnits}
              </span>
              <span className="font-label-md text-label-md text-on-surface-variant font-medium">
                unit
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
                {availablePct}% stok aktif
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Motor Terjual */}
        <div className="bg-surface-container-lowest rounded-xl p-space-lg flex flex-col justify-between border border-outline-variant/60 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-primary/5 rounded-full pointer-events-none group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-primary-fixed-variant uppercase tracking-wider font-semibold">
              Motor Terjual
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-DEFAULT bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-label-sm font-bold">
              Terjual
            </span>
          </div>
          <div className="mt-space-md flex flex-col">
            <div className="flex items-baseline gap-space-xs">
              <span className="font-display-lg text-display-lg text-primary font-bold tabular-nums">
                {soldUnits}
              </span>
              <span className="font-label-md text-label-md text-on-surface-variant font-medium">
                unit
              </span>
            </div>
            <div className="mt-space-xs flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
              <span>Tahun 2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action & Model Health Banner */}
      <div className="bg-surface-container-lowest rounded-xl p-space-lg mb-space-xl border border-outline-variant/60 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
        <div className="flex flex-col sm:flex-row sm:items-center gap-space-md">
          <Link
            className="inline-flex items-center justify-center px-space-lg py-2.5 bg-primary text-on-primary font-label-md text-label-md font-semibold rounded-DEFAULT hover:bg-primary-container transition-colors shadow-sm"
            href="/admin/data-motor"
          >
            <span>Tambah Unit Motor</span>
          </Link>
          <Link
            className="inline-flex items-center justify-center px-space-lg py-2.5 bg-secondary-container text-primary font-label-md text-label-md font-semibold rounded-DEFAULT hover:bg-secondary-fixed transition-colors"
            href="/admin/estimasi"
          >
            <span>Cek Estimasi Harga</span>
          </Link>
        </div>

        {/* ML Performance Indicator Badge */}
        <div className="flex items-center gap-space-xs pt-space-xs lg:pt-0">
          <div className="flex items-center gap-1.5">
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              Model Random Forest
            </span>
            <span className="text-outline-variant">•</span>
            <span className="font-label-sm text-label-sm font-bold text-tertiary-container">
              Akurasi R² 94.6%
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Recent Motors Table + Sidebar ML History */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-xl items-start">
        {/* Left 8 Cols: Data Motor Terbaru Table */}
        <div className="xl:col-span-8 flex flex-col bg-surface-container-lowest rounded-xl border border-outline-variant/60 shadow-sm overflow-hidden">
          <div className="px-space-lg py-space-md flex items-center justify-between bg-surface-container-lowest border-b border-outline-variant/40">
            <h2 className="font-headline-sm text-headline-sm text-primary font-bold">
              Data motor terbaru
            </h2>
            <Link
              className="inline-flex items-center gap-1 text-primary hover:text-primary-container font-label-md text-label-md font-semibold transition-colors"
              href="/admin/data-motor"
            >
              <span>Lihat Semua ({totalUnits})</span>
            </Link>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary text-on-primary text-[12px] uppercase tracking-wider">
                  <th className="py-3 px-space-lg font-semibold">
                    Merek / Tipe
                  </th>
                  <th className="py-3 px-space-md font-semibold">Tahun</th>
                  <th className="py-3 px-space-md font-semibold">
                    Harga Jual
                  </th>
                  <th className="py-3 px-space-md font-semibold">Status</th>
                  <th className="py-3 px-space-lg font-semibold text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="text-[13px] divide-y divide-outline-variant/30 bg-surface-container-lowest">
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
                      <td className="py-2.5 px-space-lg">
                        <div className="flex items-center gap-space-sm">
                          <img
                            alt={`${motor.merek} ${motor.tipe}`}
                            className="w-11 h-8 object-cover rounded-DEFAULT bg-surface-container shadow-xs shrink-0"
                            src={thumb}
                          />
                          <div className="flex flex-col min-w-0">
                            <Link
                              href={`/katalog/${motor.id_motor}`}
                              className="text-[13px] font-semibold text-on-surface group-hover:text-primary transition-colors truncate"
                            >
                              {motor.merek} {motor.tipe}
                            </Link>
                            <span className="text-[11px] text-on-surface-variant">
                              {motor.nopol} •{" "}
                              {formatNumberID(motor.kilometer)} km
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-space-md text-on-surface tabular-nums">
                        {motor.tahun}
                      </td>
                      <td className="py-2.5 px-space-md">
                        <span className="text-[13px] text-primary font-semibold tabular-nums">
                          {formatRupiah(motor.harga_jual)}
                        </span>
                      </td>
                      <td className="py-2.5 px-space-md">
                        {isAvailable ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant text-[11px] font-semibold">
                            Tersedia
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-variant text-on-surface-variant text-[11px] font-semibold">
                            Terjual
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-space-lg text-right text-[12px] whitespace-nowrap">
                        <Link
                          href="/admin/data-motor"
                          className="text-primary hover:text-primary-container font-semibold transition-colors"
                        >
                          Ubah
                        </Link>
                        <span className="text-outline-variant mx-1.5">|</span>
                        <button
                          type="button"
                          onClick={() => setDeletingMotor(motor)}
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

          <div className="px-space-lg py-2.5 bg-surface-container-low/50 border-t border-outline-variant/40 flex items-center justify-between text-[12px] text-on-surface-variant">
            <span>
              Menampilkan {recentMotors.length} dari {totalUnits} unit
            </span>
          </div>
        </div>

        {/* Right 4 Cols: Riwayat Prediksi ML Terakhir + Visual Card */}
        <div className="xl:col-span-4 flex flex-col gap-space-md">
          <div className="bg-surface-container-lowest rounded-xl p-space-lg border border-outline-variant/60 shadow-sm flex flex-col">
            <div className="pb-space-sm mb-space-xs border-b border-outline-variant/30">
              <h3 className="font-headline-sm text-headline-sm text-primary font-bold">
                Riwayat Prediksi ML
              </h3>
            </div>

            <div className="flex flex-col gap-space-sm mt-space-sm">
              {recentPredictions.map((pred) => (
                <div
                  key={pred.id_prediksi}
                  className="p-space-sm bg-surface-container-low/70 rounded-lg border border-outline-variant/40 flex flex-col gap-1 hover:bg-surface-container transition-colors shadow-xs"
                >
                  <div className="flex items-start justify-between gap-space-xs">
                    <span className="text-[13px] font-semibold text-on-surface truncate">
                      {pred.nama_motor_katalog ||
                        `${pred.fitur_masukan.merek} (${pred.fitur_masukan.tahun})`}
                    </span>
                    <span className="text-[11px] text-on-surface-variant whitespace-nowrap">
                      {pred.waktu_relatif}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-on-surface-variant">
                      {formatNumberID(pred.fitur_masukan.kilometer)} km •{" "}
                      {pred.fitur_masukan.kondisi_mesin}
                    </span>
                    <span className="text-[13px] font-semibold text-primary tabular-nums">
                      {formatRupiah(pred.harga_estimasi)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <Link
              className="mt-space-md py-2 text-center text-primary font-label-md text-label-md font-semibold bg-secondary-container hover:bg-secondary-fixed rounded-DEFAULT transition-colors"
              href="/admin/riwayat-estimasi"
            >
              Lihat Semua Riwayat
            </Link>
          </div>

          {/* Quick Showroom Insight Card */}
          <div className="bg-primary text-on-primary rounded-xl p-space-lg border border-primary-container shadow-sm relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary-fixed/10 rounded-full pointer-events-none"></div>
            <div className="flex items-center justify-between mb-space-xs">
              <span className="font-label-sm text-label-sm text-primary-fixed-dim uppercase tracking-wider font-semibold">
                Total Valuasi Stok
              </span>
            </div>
            <div className="font-headline-sm text-headline-sm font-bold text-on-primary mb-space-sm tabular-nums">
              {formatRupiah(totalInventoryValue)}
            </div>
            <div className="flex flex-col gap-1.5 pt-space-xs">
              <div className="flex justify-between font-label-sm text-label-sm">
                <span className="text-primary-fixed-dim">
                  Stok Tersedia ({availableUnits}/{totalUnits})
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

      {/* Delete Motor Confirmation Modal */}
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
              dari sistem inventaris?
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
                onClick={() => {
                  if (!deletingMotor) return;
                  setIsDeleting(true);
                  setTimeout(() => {
                    deleteMotor(deletingMotor.id_motor);
                    setIsDeleting(false);
                    setDeletingMotor(null);
                  }, 400);
                }}
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
    </div>
  );
}
