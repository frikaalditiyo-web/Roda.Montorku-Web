import { NextResponse } from "next/server";
import { MODEL_METRICS } from "@/lib/mlEngine";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    app: "Roda.Motorku Web & ML API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    ml_models: MODEL_METRICS.map((m) => ({
      name: m.nama_model,
      r2_score: `${(m.r2_score * 100).toFixed(1)}%`,
      mae: `Rp ${m.mae.toLocaleString("id-ID")}`,
      rmse: `Rp ${m.rmse.toLocaleString("id-ID")}`,
      is_best: m.is_best,
    })),
  });
}
