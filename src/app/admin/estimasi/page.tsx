"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useShowroom } from "@/context/ShowroomContext";
import {
  calculateMLPrediction,
  formatNumberID,
  formatRupiah,
  MODEL_METRICS,
  Motor,
} from "@/data/mockShowroomData";

export default function EstimasiHargaMLPage() {
  const router = useRouter();
  const { addPrediction, addMotor, linkPredictionToMotor, motors } =
    useShowroom();

  // 8 Features from Proposal Tabel 3.1 + Model Selection
  const [brand, setBrand] = useState<Motor["merek"]>("Honda");
  const [condition, setCondition] = useState("Sangat Baik");
  const [year, setYear] = useState(2023);
  const [docs, setDocs] = useState("Lengkap (STNK + BPKB + Faktur)");
  const [engineCc, setEngineCc] = useState(160);
  const [samsat, setSamsat] = useState("Jakarta Selatan (Plat B)");
  const [mileage, setMileage] = useState(12450);
  const [purchasePriceInput, setPurchasePriceInput] = useState("19.500.000");

  const [selectedModel, setSelectedModel] = useState<
    | "Random Forest Regressor v1.4"
    | "Linear Regression"
    | "Decision Tree Regressor"
  >("Random Forest Regressor v1.4");

  const [isCalculating, setIsCalculating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastPredictionId, setLastPredictionId] = useState<number | null>(null);

  // Save to Catalog Modal state (KF-05)
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [tipeMotorBaru, setTipeMotorBaru] = useState("Vario 160 CBS");
  const [nopolMotorBaru, setNopolMotorBaru] = useState("B 4819 KOX");
  const [hargaJualAkhir, setHargaJualAkhir] = useState(23850000);

  const parseRupiah = (val: string) =>
    parseInt(val.replace(/[^0-9]/g, ""), 10) || 0;

  const purchasePrice = parseRupiah(purchasePriceInput) || 19500000;

  const currentEstimation = calculateMLPrediction(
    {
      merek: brand,
      tahun: year,
      cc: engineCc,
      kilometer: mileage,
      kondisi_mesin: condition,
      kelengkapan_dokumen: docs,
      domisili_samsat: samsat,
      harga_beli: purchasePrice,
    },
    selectedModel
  );

  // Also calculate all 3 models for comparison table (Bab II & III Proposal)
  const allModelsComparison = MODEL_METRICS.map((m) => ({
    ...m,
    calc: calculateMLPrediction(
      {
        merek: brand,
        tahun: year,
        cc: engineCc,
        kilometer: mileage,
        kondisi_mesin: condition,
        kelengkapan_dokumen: docs,
        domisili_samsat: samsat,
        harga_beli: purchasePrice,
      },
      m.nama_model
    ),
  }));

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleFormatPurchaseInput = (val: string) => {
    const clean = val.replace(/[^0-9]/g, "");
    if (!clean) {
      setPurchasePriceInput("0");
      return;
    }
    setPurchasePriceInput(formatNumberID(parseInt(clean, 10)));
  };

  const handleCalculateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);
    setTimeout(() => {
      setIsCalculating(false);
      const savedPred = addPrediction({
        id_user: 1,
        id_motor: null,
        catatan_simulasi: "Kalkulasi Konsol Valuasi",
        fitur_masukan: {
          merek: brand,
          tahun: year,
          cc: engineCc,
          kilometer: mileage,
          kondisi_mesin: condition,
          kelengkapan_dokumen: docs,
          domisili_samsat: samsat,
          harga_beli: purchasePrice,
        },
        harga_estimasi: currentEstimation.estimatedPrice,
        spread_estimasi: currentEstimation.mae,
        nama_model: selectedModel,
        akurasi_r2: currentEstimation.r2Score,
        mae_rupiah: currentEstimation.mae,
        rmse_rupiah: currentEstimation.rmse,
        detail_parameter_model: currentEstimation.detailParam,
      });
      setLastPredictionId(savedPred.id_prediksi);
      setHargaJualAkhir(currentEstimation.estimatedPrice);
      triggerToast(
        `Estimasi unit ${brand} (${year}) berhasil dihitung & dicatat di riwayat: ${formatRupiah(
          currentEstimation.estimatedPrice
        )}`
      );
    }, 350);
  };

  const handleResetForm = () => {
    setBrand("Yamaha");
    setYear(2022);
    setEngineCc(155);
    setMileage(18500);
    setCondition("Baik");
    setDocs("Lengkap (STNK + BPKB + Faktur)");
    setSamsat("Jakarta Timur (Plat B)");
    setPurchasePriceInput("21.000.000");
    triggerToast("Form telah direset untuk input unit berikutnya.");
  };

  const handleOpenSaveModal = () => {
    setHargaJualAkhir(currentEstimation.estimatedPrice);
    setShowSaveModal(true);
  };

  const handleConfirmSaveToCatalog = (e: React.FormEvent) => {
    e.preventDefault();
    const createdMotor = addMotor({
      id_user: 1,
      sku: `RDK-${String(year).slice(-2)}-${brand.slice(0, 3).toUpperCase()}-ML`,
      nopol: nopolMotorBaru,
      merek: brand,
      tipe: tipeMotorBaru,
      tahun: year,
      cc: engineCc,
      kilometer: mileage,
      kondisi_mesin: condition,
      kelengkapan_dokumen: docs,
      domisili_samsat: samsat,
      pajak_info: "Pajak hidup s/d Oktober 2026",
      harga_beli: purchasePrice,
      harga_jual: hargaJualAkhir,
      harga_pasar_coret:
        Math.round((hargaJualAkhir * 1.05) / 50000) * 50000,
      deskripsi: `Unit hasil valuasi ${selectedModel} (Estimasi: ${formatRupiah(
        currentEstimation.estimatedPrice
      )}). Kondisi mesin ${condition}, kelengkapan ${docs}.`,
      status: "Tersedia",
      foto_motor: motors[0]?.foto_motor || [],
    });

    if (lastPredictionId !== null) {
      linkPredictionToMotor(lastPredictionId, createdMotor);
    } else {
      addPrediction({
        id_user: 1,
        id_motor: createdMotor.id_motor,
        nama_motor_katalog: `${createdMotor.merek} ${createdMotor.tipe}`,
        nopol_katalog: createdMotor.nopol,
        kode_motor_katalog: `MTR-${String(createdMotor.id_motor).padStart(
          3,
          "0"
        )}`,
        fitur_masukan: {
          merek: brand,
          tahun: year,
          cc: engineCc,
          kilometer: mileage,
          kondisi_mesin: condition,
          kelengkapan_dokumen: docs,
          domisili_samsat: samsat,
          harga_beli: purchasePrice,
        },
        harga_estimasi: currentEstimation.estimatedPrice,
        spread_estimasi: currentEstimation.mae,
        nama_model: selectedModel,
        akurasi_r2: currentEstimation.r2Score,
        mae_rupiah: currentEstimation.mae,
        rmse_rupiah: currentEstimation.rmse,
        detail_parameter_model: currentEstimation.detailParam,
      });
    }

    setShowSaveModal(false);
    triggerToast(
      `Unit ${brand} ${tipeMotorBaru} (${formatRupiah(
        hargaJualAkhir
      )}) berhasil disimpan ke Katalog!`
    );
  };

  return (
    <div className="flex flex-col w-full">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-space-md py-space-sm rounded-lg shadow-xl flex items-center gap-space-sm">
          <span className="material-symbols-outlined text-tertiary-fixed text-[20px]">
            check_circle
          </span>
          <span className="font-label-md text-label-md">{toastMessage}</span>
        </div>
      )}

      {/* Page Header & Model Status Strip */}
      <div className="flex flex-col gap-space-xs mb-space-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-space-sm">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">
              Estimasi Harga Jual
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
              Prediksi rekomendasi harga pasar dan harga jual motor bekas
              menggunakan metode Supervised Learning (Linear Regression,
              Decision Tree, &amp; Random Forest).
            </p>
          </div>
          <div className="flex items-center gap-space-xs self-start lg:self-center">
            <span className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded bg-secondary-container text-on-secondary-fixed font-label-sm text-label-sm font-semibold shadow-sm">
              <span className="material-symbols-outlined text-[15px] text-primary">
                memory
              </span>
              v1.4.0 Engine
            </span>
            <span className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-medium">
              <span className="material-symbols-outlined text-[15px] text-tertiary">
                database
              </span>
              PostgreSQL Connected
            </span>
          </div>
        </div>

        {/* Active ML Status Strip */}
        <div className="mt-space-xs bg-surface-container-lowest p-space-sm rounded-lg shadow-sm flex flex-wrap items-center justify-between gap-space-sm text-on-surface-variant">
          <div className="flex items-center gap-space-sm flex-wrap">
            <div className="flex items-center gap-1.5 font-label-sm text-label-sm font-semibold text-primary">
              <span className="material-symbols-outlined text-[16px] text-primary">
                model_training
              </span>
              <span>Model Aktif: {selectedModel}</span>
            </div>
            <span className="hidden sm:inline text-outline-variant">•</span>
            <div className="flex items-center gap-1.5 font-body-sm text-body-sm text-secondary">
              <span className="material-symbols-outlined text-[16px] text-secondary">
                dataset
              </span>
              <span>
                Skema Pengkodean: One-Hot Encoding • Split Data Latih:Uji (80:20)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-tertiary-fixed-variant bg-tertiary-fixed px-space-xs py-0.5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-ping"></span>
            <span className="font-semibold">Flask Service: Active (:5000)</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        {/* LEFT COLUMN: 8-Feature ML Parameter Input Form (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-space-md">
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-md flex flex-col relative overflow-hidden">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-space-sm mb-space-md border-b border-surface-container">
              <div className="flex items-center gap-space-xs">
                <div className="w-8 h-8 rounded bg-secondary-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">
                    tune
                  </span>
                </div>
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-primary font-bold">
                    Parameter Masukan Motor
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    8 fitur spesifikasi penentu valuasi pasar (Tabel 3.1
                    Proposal)
                  </p>
                </div>
              </div>

              {/* Model Selector */}
              <div className="flex items-center gap-1.5">
                <span className="font-label-sm text-label-sm text-secondary">
                  Algoritma:
                </span>
                <select
                  value={selectedModel}
                  onChange={(e) =>
                    setSelectedModel(
                      e.target.value as
                        | "Random Forest Regressor v1.4"
                        | "Linear Regression"
                        | "Decision Tree Regressor"
                    )
                  }
                  className="bg-secondary-container text-primary font-label-sm text-label-sm px-2.5 py-1.5 rounded font-bold cursor-pointer focus:outline-none"
                >
                  <option value="Random Forest Regressor v1.4">
                    Random Forest (Terbaik)
                  </option>
                  <option value="Linear Regression">Linear Regression</option>
                  <option value="Decision Tree Regressor">
                    Decision Tree Regressor
                  </option>
                </select>
              </div>
            </div>

            <form
              className="flex flex-col gap-space-md"
              onSubmit={handleCalculateSubmit}
            >
              {/* 2x4 Feature Grid (8 Features from Proposal) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                {/* 1. Merek Motor */}
                <div className="flex flex-col gap-1">
                  <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center justify-between">
                    <span>1. Merek Motor</span>
                    <span className="font-label-sm text-label-sm text-outline font-normal">
                      Kategorikal
                    </span>
                  </label>
                  <select
                    value={brand}
                    onChange={(e) =>
                      setBrand(e.target.value as Motor["merek"])
                    }
                    className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md py-2.5 px-space-sm rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    <option value="Honda">Honda</option>
                    <option value="Yamaha">Yamaha</option>
                    <option value="Vespa">Vespa</option>
                    <option value="Suzuki">Suzuki</option>
                    <option value="Kawasaki">Kawasaki</option>
                  </select>
                </div>

                {/* 2. Kondisi Mesin */}
                <div className="flex flex-col gap-1">
                  <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center justify-between">
                    <span>6. Kondisi Mesin</span>
                    <span className="font-label-sm text-label-sm text-outline font-normal">
                      Kategorikal
                    </span>
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md py-2.5 px-space-sm rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    <option value="Sangat Baik">
                      Sangat Baik (Halus, Kering)
                    </option>
                    <option value="Baik">Baik (Tarikan Normal)</option>
                    <option value="Cukup">Cukup (Rembes Ringan)</option>
                    <option value="Butuh Servis">
                      Butuh Servis / Turun Mesin
                    </option>
                  </select>
                </div>

                {/* 3. Tahun Pembuatan */}
                <div className="flex flex-col gap-1">
                  <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center justify-between">
                    <span>2. Tahun Pembuatan</span>
                    <span className="font-label-sm text-label-sm text-outline font-normal">
                      Numerik (2010 - 2026)
                    </span>
                  </label>
                  <input
                    value={year}
                    onChange={(e) =>
                      setYear(parseInt(e.target.value, 10) || 2023)
                    }
                    className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md py-2.5 px-space-sm rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    max={2026}
                    min={2010}
                    required
                    type="number"
                  />
                </div>

                {/* 4. Kelengkapan Dokumen */}
                <div className="flex flex-col gap-1">
                  <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center justify-between">
                    <span>3. Kelengkapan Dokumen</span>
                    <span className="font-label-sm text-label-sm text-outline font-normal">
                      Kategorikal
                    </span>
                  </label>
                  <select
                    value={docs}
                    onChange={(e) => setDocs(e.target.value)}
                    className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md py-2.5 px-space-sm rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    <option value="Lengkap (STNK + BPKB + Faktur)">
                      Lengkap (STNK + BPKB + Faktur)
                    </option>
                    <option value="Lengkap (STNK + BPKB)">
                      Lengkap (STNK + BPKB)
                    </option>
                    <option value="Hanya STNK">Hanya STNK (Tanpa BPKB)</option>
                  </select>
                </div>

                {/* 5. Kapasitas Mesin (CC) */}
                <div className="flex flex-col gap-1">
                  <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center justify-between">
                    <span>8. Kapasitas Mesin (CC)</span>
                    <span className="font-label-sm text-label-sm text-outline font-normal">
                      Numerik
                    </span>
                  </label>
                  <div className="flex items-center shadow-sm rounded overflow-hidden">
                    <input
                      value={engineCc}
                      onChange={(e) =>
                        setEngineCc(parseInt(e.target.value, 10) || 110)
                      }
                      className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md py-2.5 px-space-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      max={1000}
                      min={50}
                      required
                      type="number"
                    />
                    <span className="bg-surface-container text-on-surface-variant font-label-md text-label-md px-space-md py-2.5 shrink-0 select-none">
                      cc
                    </span>
                  </div>
                </div>

                {/* 6. Domisili Samsat */}
                <div className="flex flex-col gap-1">
                  <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center justify-between">
                    <span>7. Domisili Samsat</span>
                    <span className="font-label-sm text-label-sm text-outline font-normal">
                      Kategorikal
                    </span>
                  </label>
                  <select
                    value={samsat}
                    onChange={(e) => setSamsat(e.target.value)}
                    className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md py-2.5 px-space-sm rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    <option value="Jakarta Selatan (Plat B)">
                      Jakarta Selatan (Plat B)
                    </option>
                    <option value="Jakarta Timur (Plat B)">
                      Jakarta Timur (Plat B)
                    </option>
                    <option value="Depok (Plat B)">Depok (Plat B)</option>
                    <option value="Tangerang (Plat B)">
                      Tangerang (Plat B)
                    </option>
                    <option value="Bekasi (Plat B)">Bekasi (Plat B)</option>
                    <option value="Bogor (Plat F)">Bogor (Plat F)</option>
                    <option value="Kediri (Plat AG)">Kediri (Plat AG)</option>
                  </select>
                </div>

                {/* 7. Kilometer Ditempuh */}
                <div className="flex flex-col gap-1">
                  <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center justify-between">
                    <span>4. Kilometer Ditempuh</span>
                    <span className="font-label-sm text-label-sm text-outline font-normal">
                      Numerik (Odometer)
                    </span>
                  </label>
                  <div className="flex items-center shadow-sm rounded overflow-hidden">
                    <input
                      value={mileage}
                      onChange={(e) =>
                        setMileage(parseInt(e.target.value, 10) || 0)
                      }
                      className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md py-2.5 px-space-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      min={0}
                      required
                      type="number"
                    />
                    <span className="bg-surface-container text-on-surface-variant font-label-md text-label-md px-space-md py-2.5 shrink-0 select-none">
                      km
                    </span>
                  </div>
                </div>

                {/* 8. Harga Beli Showroom (Rp) */}
                <div className="flex flex-col gap-1">
                  <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center justify-between">
                    <span>5. Harga Beli (Kulakan)</span>
                    <span className="font-label-sm text-label-sm text-outline font-normal">
                      Modal Showroom
                    </span>
                  </label>
                  <div className="flex items-center shadow-sm rounded overflow-hidden">
                    <span className="bg-surface-container text-primary font-label-md text-label-md px-space-md py-2.5 font-bold shrink-0 select-none">
                      Rp
                    </span>
                    <input
                      value={purchasePriceInput}
                      onChange={(e) =>
                        handleFormatPurchaseInput(e.target.value)
                      }
                      className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md py-2.5 px-space-sm text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                      type="text"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button & Endpoint Indicator */}
              <div className="mt-space-sm flex flex-col gap-2">
                <button
                  disabled={isCalculating}
                  className="w-full bg-primary hover:bg-[#132742] text-on-primary py-3.5 px-space-md rounded font-label-lg text-label-lg font-bold flex items-center justify-center gap-space-xs transition-all duration-150 shadow-md cursor-pointer disabled:opacity-75"
                  type="submit"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {isCalculating ? "hourglass_top" : "bolt"}
                  </span>
                  <span>
                    {isCalculating
                      ? "Menghubungkan ke Flask Engine..."
                      : "Hitung Estimasi Harga & Simpan Log"}
                  </span>
                </button>
                <div className="flex items-center justify-between px-1 text-on-surface-variant">
                  <div className="flex items-center gap-1 font-label-sm text-label-sm">
                    <span className="material-symbols-outlined text-[15px] text-tertiary">
                      check_circle
                    </span>
                    <span>Validasi 8 fitur masukan otomatis</span>
                  </div>
                  <div className="inline-flex items-center gap-1 font-label-sm text-label-sm text-secondary bg-surface-container px-2 py-0.5 rounded">
                    <span className="material-symbols-outlined text-[14px]">
                      terminal
                    </span>
                    <code className="font-mono text-[11px]">
                      POST /api/predict
                    </code>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Perbandingan 3 Algoritma Regresi (Sesuai Bab II & III Proposal) */}
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  compare_arrows
                </span>
                <span className="font-label-md text-label-md text-primary font-bold">
                  Komparasi Performa 3 Algoritma Regresi (MAE, RMSE, &amp; R²)
                </span>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Data Uji 20%
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-body-sm text-body-sm">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase">
                    <th className="py-2 px-3">Algoritma</th>
                    <th className="py-2 px-3 text-right">Estimasi Harga</th>
                    <th className="py-2 px-3 text-right">MAE</th>
                    <th className="py-2 px-3 text-right">RMSE</th>
                    <th className="py-2 px-3 text-right">R² Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container">
                  {allModelsComparison.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedModel(item.nama_model)}
                      className={`cursor-pointer transition-colors ${
                        selectedModel === item.nama_model
                          ? "bg-secondary-container/50 font-semibold"
                          : "hover:bg-surface-container-low"
                      }`}
                    >
                      <td className="py-2.5 px-3 flex items-center gap-1.5">
                        <span className="text-primary font-bold">
                          {item.short_name}
                        </span>
                        {item.is_best && (
                          <span className="px-1.5 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed-variant text-[10px] font-bold">
                            Terbaik
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-primary tabular-nums">
                        {formatRupiah(item.calc.estimatedPrice)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-secondary tabular-nums">
                        ±{formatRupiah(item.mae)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-secondary tabular-nums">
                        {formatRupiah(item.rmse)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-tertiary tabular-nums">
                        {(item.r2_score * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Feature Importance Weight Matrix */}
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  analytics
                </span>
                <span className="font-label-md text-label-md text-primary font-bold">
                  Korelasi Fitur Valuasi (Weight Matrix)
                </span>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Model Tree Split
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm mt-1">
              <div className="bg-surface-container-low p-space-sm rounded">
                <span className="font-label-sm text-label-sm text-on-surface-variant block truncate">
                  Tahun Pembuatan
                </span>
                <span className="font-headline-sm text-headline-sm font-bold text-primary">
                  34.8%
                </span>
                <div className="w-full bg-surface-container-highest h-1 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full"
                    style={{ width: "34.8%" }}
                  ></div>
                </div>
              </div>
              <div className="bg-surface-container-low p-space-sm rounded">
                <span className="font-label-sm text-label-sm text-on-surface-variant block truncate">
                  Jarak Tempuh (KM)
                </span>
                <span className="font-headline-sm text-headline-sm font-bold text-primary">
                  26.2%
                </span>
                <div className="w-full bg-surface-container-highest h-1 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="bg-primary-container h-full rounded-full"
                    style={{ width: "26.2%" }}
                  ></div>
                </div>
              </div>
              <div className="bg-surface-container-low p-space-sm rounded">
                <span className="font-label-sm text-label-sm text-on-surface-variant block truncate">
                  Kondisi Mesin
                </span>
                <span className="font-headline-sm text-headline-sm font-bold text-primary">
                  21.5%
                </span>
                <div className="w-full bg-surface-container-highest h-1 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="bg-secondary h-full rounded-full"
                    style={{ width: "21.5%" }}
                  ></div>
                </div>
              </div>
              <div className="bg-surface-container-low p-space-sm rounded">
                <span className="font-label-sm text-label-sm text-on-surface-variant block truncate">
                  Kelengkapan Dokumen
                </span>
                <span className="font-headline-sm text-headline-sm font-bold text-primary">
                  17.5%
                </span>
                <div className="w-full bg-surface-container-highest h-1 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="bg-on-tertiary-container h-full rounded-full"
                    style={{ width: "17.5%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Machine Learning Estimation Result Panel (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-space-md sticky top-20">
          <div className="bg-surface-container-lowest rounded-xl shadow-xl p-space-lg flex flex-col relative transition-all duration-200">
            <div className="flex items-center justify-between pb-space-sm border-b border-secondary-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">
                  price_check
                </span>
                <h2 className="font-headline-sm text-headline-sm text-primary font-bold">
                  Hasil Estimasi
                </h2>
              </div>
              <span className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-sm text-label-sm font-bold shadow-xs">
                <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                <span>Sukses Dihitung (200 OK)</span>
              </span>
            </div>

            {/* Valuation Main Result Output */}
            <div className="mt-space-md bg-secondary-container/40 p-space-md rounded-lg flex flex-col items-center text-center">
              <span className="font-label-md text-label-md text-secondary uppercase tracking-wider font-semibold">
                Rekomendasi Harga Jual Pasar
              </span>
              <div className="my-space-xs flex items-baseline justify-center gap-1">
                <span className="font-display-lg text-display-lg font-bold text-primary tracking-tight tabular-nums">
                  {formatRupiah(currentEstimation.estimatedPrice)}
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-space-sm py-0.5 rounded bg-surface-container-lowest text-tertiary font-label-sm text-label-sm font-semibold shadow-xs">
                <span className="material-symbols-outlined text-[16px]">
                  verified
                </span>
                <span>
                  Tingkat Determinasi Model (R²): {currentEstimation.r2Score}%
                </span>
              </div>
            </div>

            {/* Detailed Breakdown Grid */}
            <div className="mt-space-md flex flex-col gap-space-sm">
              <div className="p-space-sm rounded bg-surface-container-low flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-secondary text-[20px]">
                    swap_horiz
                  </span>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      Rentang Taksiran Wajar
                    </span>
                    <span className="font-body-sm text-body-sm text-secondary">
                      Batas minimum s/d premium
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-label-lg text-label-lg font-bold text-on-surface tabular-nums">
                    {formatRupiah(currentEstimation.rangeLow)} —{" "}
                    {formatRupiah(currentEstimation.rangeHigh)}
                  </span>
                </div>
              </div>

              <div className="p-space-sm rounded bg-tertiary-fixed/30 flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-tertiary text-[20px]">
                    trending_up
                  </span>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-on-tertiary-fixed-variant font-medium">
                      Estimasi Margin Showroom
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant tabular-nums">
                      Dari Modal Beli: {formatRupiah(purchasePrice)}
                    </span>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className="font-label-lg text-label-lg font-bold text-tertiary tabular-nums">
                    {currentEstimation.marginShowroom >= 0 ? "+" : ""}
                    {formatRupiah(currentEstimation.marginShowroom)}
                  </span>
                  <span className="font-label-sm text-label-sm text-tertiary font-semibold tabular-nums">
                    (ROI {currentEstimation.roiPct >= 0 ? "+" : ""}
                    {currentEstimation.roiPct}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Model Statistical Metadata Strip */}
            <div className="mt-space-md p-space-sm bg-surface-container rounded-lg flex flex-col gap-1 text-on-surface-variant">
              <div className="flex items-center gap-1.5 font-label-sm text-label-sm font-semibold text-on-surface">
                <span className="material-symbols-outlined text-[16px] text-primary">
                  science
                </span>
                <span>Metrik Evaluasi Model Regresi:</span>
              </div>
              <p className="font-body-sm text-body-sm text-secondary pl-5">
                Model: {currentEstimation.modelName} (
                <code className="font-mono text-[12px] font-semibold">
                  R²: {(currentEstimation.r2Score / 100).toFixed(3)}
                </code>
                , MAE: ±{formatRupiah(currentEstimation.mae)}, RMSE:{" "}
                {formatRupiah(currentEstimation.rmse)})
              </p>
            </div>

            {/* Stacked Operational Actions */}
            <div className="mt-space-lg flex flex-col gap-space-sm">
              <button
                onClick={handleOpenSaveModal}
                className="w-full bg-[#2E7D32] hover:bg-[#256629] text-on-tertiary py-3.5 px-space-md rounded font-label-lg text-label-lg font-bold flex items-center justify-center gap-space-xs transition-colors shadow-md cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">
                  post_add
                </span>
                <span>Simpan ke Katalog &amp; Tetapkan Harga Akhir</span>
              </button>
              <button
                onClick={handleResetForm}
                className="w-full bg-surface-container-lowest hover:bg-surface-container text-primary py-3 px-space-md rounded font-label-lg text-label-lg font-semibold flex items-center justify-center gap-space-xs transition-colors shadow-sm cursor-pointer border border-outline-variant/40"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">
                  restart_alt
                </span>
                <span>Hitung Ulang Motor Lain</span>
              </button>
            </div>
          </div>

          <div className="bg-surface-container-low p-space-sm rounded-lg flex items-start gap-space-xs text-on-surface-variant shadow-xs">
            <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">
              info
            </span>
            <div className="font-body-sm text-body-sm">
              <strong className="font-semibold text-on-surface">
                Catatan Sistem (KF-05):
              </strong>{" "}
              Hasil prediksi merupakan estimasi pendukung keputusan, sedangkan
              penetapan harga jual akhir pada katalog tetap ditentukan oleh
              Admin Showroom.
            </div>
          </div>
        </div>
      </div>

      {/* Modal Penetapan Harga Akhir & Simpan ke Katalog (KF-05) */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <form
            onSubmit={handleConfirmSaveToCatalog}
            className="bg-surface-container-lowest w-full max-w-lg rounded-xl p-space-lg shadow-2xl flex flex-col gap-space-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">
                  inventory_2
                </span>
                <h3 className="font-headline-sm text-headline-sm text-primary font-bold">
                  Simpan Hasil Estimasi ke Katalog
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
                className="text-on-surface-variant hover:text-primary cursor-pointer"
              >
                <span className="material-symbols-outlined text-[22px]">
                  close
                </span>
              </button>
            </div>

            <div className="p-space-sm rounded bg-secondary-container/50 flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-primary">
                Hasil Prediksi ({selectedModel}):
              </span>
              <span className="font-label-lg text-label-lg font-bold text-primary tabular-nums">
                {formatRupiah(currentEstimation.estimatedPrice)}
              </span>
            </div>

            <div className="flex flex-col gap-space-sm">
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1">
                  Tipe / Varian Motor ({brand})
                </label>
                <input
                  value={tipeMotorBaru}
                  onChange={(e) => setTipeMotorBaru(e.target.value)}
                  className="w-full bg-surface-container-low px-3 py-2 rounded-lg text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Contoh: Vario 160 CBS"
                  required
                  type="text"
                />
              </div>
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1">
                  Nomor Polisi (Plat)
                </label>
                <input
                  value={nopolMotorBaru}
                  onChange={(e) =>
                    setNopolMotorBaru(e.target.value.toUpperCase())
                  }
                  className="w-full bg-surface-container-low px-3 py-2 rounded-lg font-mono font-bold text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary uppercase"
                  placeholder="Contoh: B 4819 KOX"
                  required
                  type="text"
                />
              </div>
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1">
                  Tetapkan Harga Jual Akhir di Katalog (Rp)
                </label>
                <input
                  value={hargaJualAkhir}
                  onChange={(e) =>
                    setHargaJualAkhir(parseInt(e.target.value, 10) || 0)
                  }
                  className="w-full bg-surface-container-low px-3 py-2 rounded-lg font-mono font-bold text-primary text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  type="number"
                />
              </div>
            </div>

            <div className="flex justify-end gap-space-sm pt-space-xs">
              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
                className="px-space-md py-2 text-secondary font-label-md text-label-md hover:bg-surface-container rounded-lg cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-space-md py-2 bg-[#2E7D32] hover:bg-[#256629] text-white font-label-md text-label-md font-bold rounded-lg shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">
                  check_circle
                </span>
                <span>Simpan &amp; Tayangkan di Katalog</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSaveModal(false);
                  router.push("/admin/riwayat-estimasi");
                }}
                className="px-space-md py-2 bg-primary text-on-primary font-label-md text-label-md rounded-lg cursor-pointer"
              >
                Lihat Riwayat
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
