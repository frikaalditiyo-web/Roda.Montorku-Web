import { NextRequest, NextResponse } from "next/server";
import {
  predictPrice,
  predictAllModels,
  FiturMasukanML,
  ModelMetric,
} from "@/lib/mlEngine";
import {
  getAllPredictions,
  createPrediction,
} from "@/lib/repository";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthenticatedUser(request);
    if (!authUser || authUser.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Akses ditolak. Sesi admin diperlukan untuk melihat riwayat prediksi." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const model = searchParams.get("model") || undefined;
    const status = searchParams.get("status") || undefined;

    const predictions = await getAllPredictions({
      search,
      model,
      status,
    });

    return NextResponse.json({
      success: true,
      data: predictions,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch predictions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const fitur: FiturMasukanML = {
      merek: body.merek || "Honda",
      tahun: Number(body.tahun) || 2023,
      kelengkapan_dokumen: body.kelengkapan_dokumen || "Lengkap (STNK + BPKB + Faktur)",
      kilometer: Number(body.kilometer) || 12000,
      harga_beli: Number(body.harga_beli) || 15000000,
      kondisi_mesin: body.kondisi_mesin || "Sangat Baik",
      domisili_samsat: body.domisili_samsat || "Jakarta Selatan (Plat B)",
      cc: Number(body.cc) || 125,
    };

    const selectedModel = (body.model || "Random Forest Regressor v1.4") as ModelMetric["nama_model"];

    // 1. Calculate prediction with the requested model
    const estimation = predictPrice(fitur, selectedModel);

    // 2. Also calculate comparison across all 3 models (Bab II & III Laporan)
    const comparison = predictAllModels(fitur);

    // 3. Optional: save to history log if save_history flag is true or default
    let savedRecord = null;
    if (body.save_to_history !== false) {
      savedRecord = await createPrediction({
        id_user: body.id_user || 1,
        id_motor: body.id_motor || null,
        nama_motor_katalog: body.nama_motor_katalog,
        nopol_katalog: body.nopol_katalog,
        kode_motor_katalog: body.kode_motor_katalog,
        catatan_simulasi: body.catatan_simulasi || "Simulasi Estimasi Harga ML",
        fitur_masukan: fitur,
        harga_estimasi: estimation.estimatedPrice,
        spread_estimasi: Math.round(estimation.estimatedPrice * 0.025),
        nama_model: estimation.modelName,
        akurasi_r2: estimation.r2Score,
        mae_rupiah: estimation.mae,
        rmse_rupiah: estimation.rmse,
        detail_parameter_model: estimation.detailParam,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        estimation,
        comparison,
        saved_record: savedRecord,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to process prediction" },
      { status: 500 }
    );
  }
}
