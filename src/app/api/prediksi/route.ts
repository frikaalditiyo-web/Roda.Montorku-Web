import { NextRequest, NextResponse } from "next/server";
import {
  predictPrice,
  predictAllModels,
  MODEL_METRICS,
  BEST_MODEL,
  FiturMasukanML,
  ModelMetric,
} from "@/lib/mlEngine";
import { getAllPredictions, createPrediction } from "@/lib/repository";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthenticatedUser(request);
    if (!authUser || authUser.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Akses ditolak. Sesi admin diperlukan untuk melihat riwayat prediksi.",
        },
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
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Failed to fetch predictions";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthenticatedUser(request);
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Format payload JSON tidak valid." },
        { status: 400 }
      );
    }

    const saveToHistory = body.save_to_history !== false;
    if (saveToHistory && (!authUser || authUser.role !== "admin")) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Akses ditolak. Sesi admin aktif diperlukan untuk menyimpan riwayat prediksi.",
        },
        { status: 401 }
      );
    }

    const tahun = Number(body.tahun ?? 2023);
    const kilometer = Number(body.kilometer ?? 12000);
    const harga_beli = Number(body.harga_beli ?? 15000000);
    const cc = Number(body.cc ?? 125);

    if (
      isNaN(tahun) ||
      tahun < 1990 ||
      tahun > 2030 ||
      isNaN(kilometer) ||
      kilometer < 0 ||
      isNaN(harga_beli) ||
      harga_beli <= 0 ||
      isNaN(cc) ||
      cc < 50
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Parameter input ML tidak valid (periksa tahun, kilometer, cc, dan harga beli).",
        },
        { status: 400 }
      );
    }

    const fitur: FiturMasukanML = {
      merek: String(body.merek || "Honda"),
      tahun,
      kelengkapan_dokumen: String(
        body.kelengkapan_dokumen || "Lengkap (STNK + BPKB)"
      ),
      kilometer,
      harga_beli,
      kondisi_mesin: String(body.kondisi_mesin || "Sangat Baik"),
      domisili_samsat: String(body.domisili_samsat || "Nganjuk (AG)"),
      cc,
    };

    const requestedModel = String(body.model || BEST_MODEL.nama_model);
    const selectedModel = (MODEL_METRICS.find(
      (m) => m.nama_model === requestedModel
    )?.nama_model || BEST_MODEL.nama_model) as ModelMetric["nama_model"];

    const estimation = predictPrice(fitur, selectedModel);
    const comparison = predictAllModels(fitur);

    let savedRecord = null;
    if (saveToHistory && authUser) {
      savedRecord = await createPrediction({
        id_user: authUser.id_user,
        id_motor: body.id_motor ? Number(body.id_motor) : null,
        nama_motor_katalog: body.nama_motor_katalog
          ? String(body.nama_motor_katalog)
          : undefined,
        nopol_katalog: body.nopol_katalog
          ? String(body.nopol_katalog)
          : undefined,
        kode_motor_katalog: body.kode_motor_katalog
          ? String(body.kode_motor_katalog)
          : undefined,
        catatan_simulasi: String(
          body.catatan_simulasi || "Simulasi Estimasi Harga ML"
        ),
        fitur_masukan: fitur,
        harga_estimasi: estimation.estimatedPrice,
        spread_estimasi: estimation.mae,
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
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Failed to process prediction";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
