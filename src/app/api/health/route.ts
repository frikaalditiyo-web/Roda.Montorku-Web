import { NextResponse } from "next/server";
import { MODEL_METRICS, DATASET_INFO, FEATURE_IMPORTANCES } from "@/lib/mlEngine";
import { getDatabaseMode } from "@/lib/repository";

export async function GET() {
  const database = await getDatabaseMode();

  return NextResponse.json({
    status: "ok",
    app: "Roda.Motorku Web & ML API",
    version: "1.1.0",
    database,
    dataset: DATASET_INFO,
    timestamp: new Date().toISOString(),
    feature_importances: FEATURE_IMPORTANCES,
    ml_models: MODEL_METRICS.map((m) => ({
      name: m.nama_model,
      r2_score: `${(m.r2_score * 100).toFixed(1)}%`,
      mae: `Rp ${m.mae.toLocaleString("id-ID")}`,
      rmse: `Rp ${m.rmse.toLocaleString("id-ID")}`,
      is_best: m.is_best,
    })),
  });
}
