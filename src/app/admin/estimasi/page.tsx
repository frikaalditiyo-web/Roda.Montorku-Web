"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useShowroom } from "@/context/ShowroomContext";
import { CountUpNumber } from "@/components/CountUpNumber";
import {
  calculateMLPrediction,
  DATASET_DOKUMEN_OPTIONS,
  DATASET_KONDISI_OPTIONS,
  DATASET_SAMSAT_OPTIONS,
  FEATURE_IMPORTANCES,
  formatNumberID,
  formatRupiah,
  MODEL_METRICS,
  Motor,
} from "@/data/mockShowroomData";

export default function EstimasiHargaMLPage() {
  const router = useRouter();
  const { addPrediction, addMotor, linkPredictionToMotor, refreshData } =
    useShowroom();

  // 8 Features + Model Selection
  const [brand, setBrand] = useState<Motor["merek"]>("Honda");
  const [condition, setCondition] = useState("Sangat Baik");
  const [year, setYear] = useState(2023);
  const [docs, setDocs] = useState("Lengkap (STNK + BPKB)");
  const [engineCc, setEngineCc] = useState(160);
  const [samsat, setSamsat] = useState("Nganjuk (AG)");
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

  // Save to Catalog Modal state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showResetWarning, setShowResetWarning] = useState(false);
  const [isSavingToCatalog, setIsSavingToCatalog] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [tipeMotorBaru, setTipeMotorBaru] = useState("Vario 160 CBS");
  const [nopolMotorBaru, setNopolMotorBaru] = useState("AG 4819 KOX");
  const [hargaJualAkhir, setHargaJualAkhir] = useState(21800000);

  const updateField =
    <T,>(setter: (val: T) => void) =>
    (val: T) => {
      setter(val);
      if (lastPredictionId !== null) setLastPredictionId(null);
    };

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

  // Also calculate all 3 models for comparison table
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
    if (lastPredictionId !== null) setLastPredictionId(null);
    const clean = val.replace(/[^0-9]/g, "");
    if (!clean) {
      setPurchasePriceInput("0");
      return;
    }
    setPurchasePriceInput(formatNumberID(parseInt(clean, 10)));
  };

  const handleCalculateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);

    try {
      // Call backend API /api/prediksi
      const res = await fetch("/api/prediksi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merek: brand,
          tahun: year,
          cc: engineCc,
          kilometer: mileage,
          kondisi_mesin: condition,
          kelengkapan_dokumen: docs,
          domisili_samsat: samsat,
          harga_beli: purchasePrice,
          model: selectedModel,
          catatan_simulasi: "Kalkulasi Konsol Valuasi",
          save_to_history: true,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        const est = json.data.estimation;
        const saved = json.data.saved_record;
        if (saved) {
          setLastPredictionId(saved.id_prediksi);
        }
        setHargaJualAkhir(est.estimatedPrice);
        triggerToast(
          `Estimasi unit ${brand} (${year}) berhasil dihitung oleh Backend API: ${formatRupiah(
            est.estimatedPrice
          )}`
        );
        await refreshData(true);
        setIsCalculating(false);
        return;
      } else {
        triggerToast(json.message || "Gagal menghitung estimasi di server.");
        setIsCalculating(false);
        return;
      }
    } catch (err) {
      console.warn("Backend API unavailable, using local calculation fallback:", err);
    }

    setIsCalculating(false);
    const savedRes = await addPrediction({
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
    if (savedRes.success && savedRes.data) {
      setLastPredictionId(savedRes.data.id_prediksi);
    }
    setHargaJualAkhir(currentEstimation.estimatedPrice);
    triggerToast(
      `Estimasi unit ${brand} (${year}) dihitung: ${formatRupiah(
        currentEstimation.estimatedPrice
      )}`
    );
  };

  const handleResetForm = () => {
    setBrand("Yamaha");
    setYear(2022);
    setEngineCc(155);
    setMileage(18500);
    setCondition("Baik");
    setDocs("Lengkap (STNK + BPKB)");
    setSamsat("Nganjuk (AG)");
    setPurchasePriceInput("21.000.000");
    setLastPredictionId(null);
    triggerToast("Form telah direset.");
  };

  const handleOpenSaveModal = () => {
    const defaultTypeMap: Record<Motor["merek"], string> = {
      Honda: "Vario 160 CBS",
      Yamaha: "NMAX 155 Connected",
      Vespa: "Sprint 150 i-get ABS",
      Suzuki: "GSX-R150",
      Kawasaki: "KLX 150 BF",
    };
    const platPrefix = samsat.includes("Malang")
      ? "N"
      : samsat.includes("Surabaya")
      ? "L"
      : samsat.includes("Sidoarjo") || samsat.includes("Gresik")
      ? "W"
      : samsat.includes("Jombang") || samsat.includes("Mojokerto") || samsat.includes("Bojonegoro")
      ? "S"
      : "AG";
    setTipeMotorBaru(defaultTypeMap[brand] || `${brand} Bekas`);
    setNopolMotorBaru(`${platPrefix} 4819 KOX`);
    setHargaJualAkhir(currentEstimation.estimatedPrice);
    setShowSaveModal(true);
  };

  const handleConfirmSaveToCatalog = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingToCatalog(true);

    const motorRes = await addMotor({
      id_user: 1,
      sku: `RDK-${String(year).slice(-2)}-${brand.slice(0, 3).toUpperCase()}-ML`,
      nopol: nopolMotorBaru.trim().toUpperCase(),
      merek: brand,
      tipe: tipeMotorBaru.trim(),
      tahun: year,
      cc: engineCc,
      kilometer: mileage,
      kondisi_mesin: condition,
      kelengkapan_dokumen: docs,
      domisili_samsat: samsat,
      pajak_info: "Pajak hidup aktif",
      harga_beli: purchasePrice,
      harga_jual: hargaJualAkhir,
      harga_pasar_coret: Math.round((hargaJualAkhir * 1.05) / 50000) * 50000,
      deskripsi: `Unit hasil valuasi ${selectedModel} (Estimasi: ${formatRupiah(
        currentEstimation.estimatedPrice
      )}). Kondisi mesin ${condition}, kelengkapan ${docs}.`,
      status: "Tersedia",
      foto_motor: [
        {
          id_foto: 1,
          id_motor: 0,
          nama_file: "/logo.png",
          label: "Foto Placeholder",
          caption: `${brand} ${tipeMotorBaru.trim()}`,
          is_utama: true,
        },
      ],
    });

    if (!motorRes.success || !motorRes.data) {
      setIsSavingToCatalog(false);
      triggerToast(motorRes.message || "Gagal menyimpan motor baru ke katalog.");
      return;
    }

    const createdMotor = motorRes.data;

    if (lastPredictionId !== null) {
      await linkPredictionToMotor(lastPredictionId, createdMotor);
    } else {
      await addPrediction({
        id_user: 1,
        id_motor: createdMotor.id_motor,
        nama_motor_katalog: `${createdMotor.merek} ${createdMotor.tipe}`,
        nopol_katalog: createdMotor.nopol,
        kode_motor_katalog: `MTR-${String(createdMotor.id_motor).padStart(
          3,
          "0"
        )}`,
        catatan_simulasi: "Simpan Langsung ke Katalog",
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

    setIsSavingToCatalog(false);
    setSaveSuccess(true);

    setTimeout(() => {
      setSaveSuccess(false);
      setShowSaveModal(false);
      triggerToast(
        `Unit ${brand} ${tipeMotorBaru} (${formatRupiah(
          hargaJualAkhir
        )}) berhasil disimpan ke Katalog!`
      );
    }, 600);
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

      {/* Page Header */}
      <div className="flex flex-col gap-space-xs mb-space-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-space-sm">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">
              Estimasi Harga Jual
            </h1>
          </div>
        </div>

        {/* Active ML Status Strip */}
        <div className="mt-space-xs bg-surface-container-lowest p-space-sm rounded-lg shadow-sm flex flex-wrap items-center justify-between gap-space-sm text-on-surface-variant border border-outline-variant/30">
          <div className="flex items-center gap-space-sm flex-wrap">
            <div className="flex items-center gap-1.5 font-label-sm text-label-sm font-semibold text-primary">
              <span className="material-symbols-outlined text-[16px] text-primary">
                model_training
              </span>
              <span>Model Aktif: {selectedModel}</span>
            </div>
            <span className="hidden sm:inline text-outline-variant">•</span>
            <div className="flex items-center gap-1.5 font-body-sm text-body-sm text-primary">
              <span className="material-symbols-outlined text-[16px] text-primary">
                dataset
              </span>
              <span>
                Skema One-Hot Encoding • Split Latih:Uji (80:20) • 187 Sampel
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-tertiary-fixed-variant bg-tertiary-fixed px-space-xs py-0.5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-ping"></span>
            <span className="font-semibold">ML Engine API: Ready (Active)</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        {/* LEFT COLUMN: 8-Feature ML Parameter Input Form (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-space-md">
          <div className="bg-surface-container-lowest p-space-lg rounded-xl border border-outline-variant/60 shadow-sm flex flex-col relative overflow-hidden">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-space-sm mb-space-md border-b border-surface-container">
              <h2 className="font-headline-sm text-headline-sm text-primary font-bold">
                Spesifikasi Motor
              </h2>

              {/* Model Selector */}
              <div className="flex items-center gap-1.5">
                <span className="font-label-sm text-label-sm text-primary">
                  Model:
                </span>
                <select
                  value={selectedModel}
                  onChange={(e) =>
                    updateField(setSelectedModel)(
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
              {/* 2x4 Feature Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                {/* Merek Motor */}
                <div className="flex flex-col gap-1">
                  <label className="font-label-md text-label-md text-on-surface font-semibold">
                    Merek Motor
                  </label>
                  <select
                    value={brand}
                    onChange={(e) =>
                      updateField(setBrand)(e.target.value as Motor["merek"])
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

                {/* Kondisi Mesin */}
                <div className="flex flex-col gap-1">
                  <label className="font-label-md text-label-md text-on-surface font-semibold">
                    Kondisi Mesin
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => updateField(setCondition)(e.target.value)}
                    className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md py-2.5 px-space-sm rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    {DATASET_KONDISI_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tahun Pembuatan */}
                <div className="flex flex-col gap-1">
                  <label className="font-label-md text-label-md text-on-surface font-semibold">
                    Tahun Pembuatan
                  </label>
                  <input
                    value={year}
                    onChange={(e) =>
                      updateField(setYear)(parseInt(e.target.value, 10) || 2023)
                    }
                    className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md py-2.5 px-space-sm rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-primary tabular-nums"
                    max={2030}
                    min={1990}
                    required
                    type="number"
                  />
                </div>

                {/* Kelengkapan Dokumen */}
                <div className="flex flex-col gap-1">
                  <label className="font-label-md text-label-md text-on-surface font-semibold">
                    Kelengkapan Dokumen
                  </label>
                  <select
                    value={docs}
                    onChange={(e) => updateField(setDocs)(e.target.value)}
                    className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md py-2.5 px-space-sm rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    {DATASET_DOKUMEN_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Kapasitas Mesin (CC) */}
                <div className="flex flex-col gap-1">
                  <label className="font-label-md text-label-md text-on-surface font-semibold">
                    Kapasitas Mesin
                  </label>
                  <div className="flex items-center shadow-sm rounded overflow-hidden">
                    <input
                      value={engineCc}
                      onChange={(e) =>
                        updateField(setEngineCc)(parseInt(e.target.value, 10) || 110)
                      }
                      className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md py-2.5 px-space-sm focus:outline-none focus:ring-2 focus:ring-primary tabular-nums"
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

                {/* Domisili Samsat */}
                <div className="flex flex-col gap-1">
                  <label className="font-label-md text-label-md text-on-surface font-semibold">
                    Domisili Samsat
                  </label>
                  <select
                    value={samsat}
                    onChange={(e) => updateField(setSamsat)(e.target.value)}
                    className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md py-2.5 px-space-sm rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    {DATASET_SAMSAT_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Kilometer Ditempuh */}
                <div className="flex flex-col gap-1">
                  <label className="font-label-md text-label-md text-on-surface font-semibold">
                    Kilometer Ditempuh
                  </label>
                  <div className="flex items-center shadow-sm rounded overflow-hidden">
                    <input
                      value={mileage}
                      onChange={(e) =>
                        updateField(setMileage)(parseInt(e.target.value, 10) || 0)
                      }
                      className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md py-2.5 px-space-sm focus:outline-none focus:ring-2 focus:ring-primary tabular-nums"
                      min={0}
                      required
                      type="number"
                    />
                    <span className="bg-surface-container text-on-surface-variant font-label-md text-label-md px-space-md py-2.5 shrink-0 select-none">
                      km
                    </span>
                  </div>
                </div>

                {/* Harga Beli Showroom (Rp) */}
                <div className="flex flex-col gap-1">
                  <label className="font-label-md text-label-md text-on-surface font-semibold">
                    Harga Beli
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

              {/* Submit Button */}
              <div className="mt-space-xs">
                <button
                  disabled={isCalculating}
                  className="w-full bg-primary hover:bg-[#132742] text-on-primary py-3 px-space-md rounded font-label-lg text-label-lg font-bold flex items-center justify-center transition-all duration-150 shadow-md cursor-pointer disabled:opacity-75"
                  type="submit"
                >
                  <span>
                    {isCalculating
                      ? "Menghitung Estimasi..."
                      : "Hitung Estimasi Harga"}
                  </span>
                </button>
                <div className="flex items-center justify-between px-1 text-on-surface-variant mt-2">
                  <div className="flex items-center gap-1 font-label-sm text-label-sm">
                    <span className="material-symbols-outlined text-[15px] text-tertiary">
                      check_circle
                    </span>
                    <span>Validasi 8 fitur masukan otomatis</span>
                  </div>
                  <div className="inline-flex items-center gap-1 font-label-sm text-label-sm text-primary bg-surface-container px-2 py-0.5 rounded">
                    <span className="material-symbols-outlined text-[14px]">
                      terminal
                    </span>
                    <code className="font-mono text-[11px]">
                      POST /api/prediksi
                    </code>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Perbandingan 3 Algoritma Regresi */}
          <div className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant/60 shadow-sm flex flex-col gap-space-sm">
            <span className="font-label-md text-label-md text-primary font-bold">
              Perbandingan Model Regresi
            </span>

            <div className="overflow-x-auto rounded-lg overflow-hidden border border-outline-variant/60 shadow-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-primary text-on-primary text-[12px] uppercase">
                    <th className="py-2.5 px-3 font-semibold">Algoritma</th>
                    <th className="py-2.5 px-3 text-right font-semibold">
                      Estimasi Harga
                    </th>
                    <th className="py-2.5 px-3 text-right font-semibold">
                      MAE
                    </th>
                    <th className="py-2.5 px-3 text-right font-semibold">
                      RMSE
                    </th>
                    <th className="py-2.5 px-3 text-right font-semibold">R²</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container text-[13px] bg-surface-container-lowest">
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
                      <td className="py-2 px-3 flex items-center gap-1.5">
                        <span className="text-primary font-semibold">
                          {item.short_name}
                        </span>
                        {item.is_best && (
                          <span className="px-1.5 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed-variant text-[10px] font-bold">
                            Terbaik
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right font-semibold text-primary tabular-nums">
                        {formatRupiah(item.calc.estimatedPrice)}
                      </td>
                      <td className="py-2 px-3 text-right text-primary tabular-nums">
                        ±{formatRupiah(item.mae)}
                      </td>
                      <td className="py-2 px-3 text-right text-primary tabular-nums">
                        {formatRupiah(item.rmse)}
                      </td>
                      <td className="py-2 px-3 text-right font-semibold text-tertiary tabular-nums">
                        {(item.r2_score * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Feature Importance Weight Matrix */}
          <div className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant/60 shadow-sm flex flex-col gap-space-sm">
            <span className="font-label-md text-label-md text-primary font-bold">
              Bobot Pengaruh Fitur (Random Forest Terlatih)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm mt-1">
              <div className="bg-surface-container-low p-space-sm rounded">
                <span className="font-label-sm text-label-sm text-on-surface-variant block truncate">
                  Harga Beli
                </span>
                <span className="font-headline-sm text-headline-sm font-bold text-primary">
                  {FEATURE_IMPORTANCES.harga_beli}%
                </span>
                <div className="w-full bg-surface-container-highest h-1 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full"
                    style={{ width: `${FEATURE_IMPORTANCES.harga_beli}%` }}
                  ></div>
                </div>
              </div>
              <div className="bg-surface-container-low p-space-sm rounded">
                <span className="font-label-sm text-label-sm text-on-surface-variant block truncate">
                  Kilometer
                </span>
                <span className="font-headline-sm text-headline-sm font-bold text-primary">
                  {FEATURE_IMPORTANCES.kilometer}%
                </span>
                <div className="w-full bg-surface-container-highest h-1 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="bg-primary-container h-full rounded-full"
                    style={{ width: `${FEATURE_IMPORTANCES.kilometer}%` }}
                  ></div>
                </div>
              </div>
              <div className="bg-surface-container-low p-space-sm rounded">
                <span className="font-label-sm text-label-sm text-on-surface-variant block truncate">
                  Kapasitas (CC)
                </span>
                <span className="font-headline-sm text-headline-sm font-bold text-primary">
                  {FEATURE_IMPORTANCES.cc}%
                </span>
                <div className="w-full bg-surface-container-highest h-1 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="bg-secondary h-full rounded-full"
                    style={{ width: `${FEATURE_IMPORTANCES.cc}%` }}
                  ></div>
                </div>
              </div>
              <div className="bg-surface-container-low p-space-sm rounded">
                <span className="font-label-sm text-label-sm text-on-surface-variant block truncate">
                  Tahun
                </span>
                <span className="font-headline-sm text-headline-sm font-bold text-primary">
                  {FEATURE_IMPORTANCES.tahun}%
                </span>
                <div className="w-full bg-surface-container-highest h-1 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="bg-on-tertiary-container h-full rounded-full"
                    style={{ width: `${FEATURE_IMPORTANCES.tahun}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Machine Learning Estimation Result Panel (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-space-md sticky top-20">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 shadow-sm p-space-lg flex flex-col relative transition-all duration-200">
            <div className="flex items-center justify-between pb-space-sm border-b border-secondary-container">
              <h2 className="font-headline-sm text-headline-sm text-primary font-bold">
                Hasil Estimasi
              </h2>
              <span className="inline-flex items-center px-space-sm py-1 rounded bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-sm text-label-sm font-bold shadow-xs">
                <span>Akurasi R² {currentEstimation.r2Score}%</span>
              </span>
            </div>

            {/* Valuation Main Result Output */}
            <div className="mt-space-md bg-secondary-container/40 p-space-md rounded-lg flex flex-col items-center text-center">
              <span className="font-label-md text-label-md text-primary uppercase tracking-wider font-semibold">
                Rekomendasi Harga Jual
              </span>
              <div className="my-space-xs flex items-baseline justify-center gap-1">
                <span className="font-display-lg text-display-lg font-bold text-primary tracking-tight tabular-nums">
                  <CountUpNumber value={currentEstimation.estimatedPrice} format={formatRupiah} />
                </span>
              </div>
            </div>

            {/* Detailed Breakdown Grid */}
            <div className="mt-space-md flex flex-col gap-space-sm">
              <div className="p-space-sm rounded bg-surface-container-low flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Rentang Harga Pasar
                </span>
                <span className="text-[13px] font-bold text-on-surface tabular-nums">
                  {formatRupiah(currentEstimation.rangeLow)} —{" "}
                  {formatRupiah(currentEstimation.rangeHigh)}
                </span>
              </div>

              <div className="p-space-sm rounded bg-tertiary-fixed/30 flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-on-tertiary-fixed-variant font-medium">
                  Estimasi Margin
                </span>
                <div className="text-right flex items-center gap-1.5">
                  <span className="text-[13px] font-bold text-tertiary tabular-nums">
                    {currentEstimation.marginShowroom >= 0 ? "+" : ""}
                    {formatRupiah(currentEstimation.marginShowroom)}
                  </span>
                  <span className="font-label-sm text-label-sm text-tertiary font-semibold tabular-nums">
                    ({currentEstimation.roiPct >= 0 ? "+" : ""}
                    {currentEstimation.roiPct}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Stacked Operational Actions */}
            <div className="mt-space-lg flex flex-col gap-space-sm">
              <button
                onClick={handleOpenSaveModal}
                className="w-full bg-primary hover:bg-primary-container text-on-primary py-3 px-space-md rounded font-label-lg text-label-lg font-bold flex items-center justify-center transition-colors shadow-md cursor-pointer"
                type="button"
              >
                <span>Simpan ke Katalog</span>
              </button>
              <button
                onClick={() => setShowResetWarning(true)}
                className="w-full bg-surface-container-lowest hover:bg-surface-container text-primary py-2.5 px-space-md rounded font-label-lg text-label-lg font-semibold flex items-center justify-center transition-colors shadow-sm cursor-pointer border border-outline-variant/40"
                type="button"
              >
                <span>Reset Form</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Penetapan Harga Akhir & Simpan ke Katalog */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <form
            onSubmit={handleConfirmSaveToCatalog}
            className="relative bg-surface-container-lowest w-full max-w-lg rounded-xl p-space-lg shadow-2xl flex flex-col gap-space-md overflow-hidden"
          >
            {/* Saving & Success Overlay */}
            {isSavingToCatalog && (
              <div className="absolute inset-0 z-50 bg-surface/85 backdrop-blur-xs flex flex-col items-center justify-center gap-3 animate-in fade-in">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                  <span className="material-symbols-outlined text-primary text-[24px]">
                    inventory_2
                  </span>
                </div>
                <div className="text-center">
                  <h3 className="font-headline-sm text-headline-sm font-bold text-primary">
                    Menyimpan ke Katalog...
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Memasukkan unit hasil estimasi ke etalase...
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
                    Berhasil Masuk Katalog!
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Unit motor siap dipublikasikan ke calon pembeli.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">
                  inventory_2
                </span>
                <h3 className="font-headline-sm text-headline-sm text-primary font-bold">
                  Simpan ke Katalog
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
                Rekomendasi ML:
              </span>
              <span className="font-label-lg text-label-lg font-bold text-primary tabular-nums">
                {formatRupiah(currentEstimation.estimatedPrice)}
              </span>
            </div>

            <div className="flex flex-col gap-space-sm">
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1">
                  Tipe / Varian ({brand})
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
                  Nomor Polisi
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
                  Harga Jual Akhir (Rp)
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
                disabled={isSavingToCatalog || saveSuccess}
                onClick={() => setShowSaveModal(false)}
                className="px-space-md py-2 text-primary font-label-md text-label-md hover:bg-surface-container rounded-lg cursor-pointer disabled:opacity-60"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSavingToCatalog || saveSuccess}
                className="px-space-md py-2 bg-primary hover:bg-primary-container text-white font-label-md text-label-md font-bold rounded-lg shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-75"
              >
                {isSavingToCatalog ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">
                      check_circle
                    </span>
                    <span>Simpan</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSaveModal(false);
                  router.push("/admin/riwayat-estimasi");
                }}
                className="px-space-md py-2 bg-primary text-on-primary font-label-md text-label-md rounded-lg cursor-pointer"
              >
                Riwayat
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reset Form Confirmation Warning Modal */}
      {showResetWarning && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-200 animate-in fade-in">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-2xl p-6 max-w-sm w-full flex flex-col gap-4 text-left animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary-container text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">
                  restart_alt
                </span>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm font-bold text-primary tracking-tight">
                  Reset Formulir Estimasi
                </h3>
                <span className="text-[12px] text-on-surface-variant font-medium">
                  Kembalikan ke Nilai Default
                </span>
              </div>
            </div>

            <p className="font-body-md text-body-md text-on-surface-variant">
              Apakah Anda yakin ingin mengosongkan seluruh parameter spesifikasi motor yang telah diinput ke formulir kalkulator ini?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-outline-variant/30">
              <button
                type="button"
                onClick={() => setShowResetWarning(false)}
                className="px-4 py-2 rounded-xl text-primary font-label-md text-label-md font-semibold bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  handleResetForm();
                  setShowResetWarning(false);
                }}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">
                  restart_alt
                </span>
                <span>Ya, Reset Form</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
