import { NextRequest, NextResponse } from "next/server";
import { getAllMotors, getAllPredictions } from "@/lib/repository";
import { MODEL_METRICS } from "@/lib/mlEngine";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthenticatedUser(request);
    if (!authUser || authUser.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Akses ditolak. Sesi admin diperlukan untuk melihat ringkasan analitik." },
        { status: 401 }
      );
    }

    const motorsRes = await getAllMotors({ limit: 1000 });
    const motors = motorsRes.data;
    const predictions = await getAllPredictions();

    const totalMotors = motors.length;
    const availableMotors = motors.filter((m) => m.status === "Tersedia").length;
    const soldMotors = motors.filter((m) => m.status === "Terjual").length;

    const totalInventoryValue = motors.reduce((sum, m) => sum + m.harga_jual, 0);
    const totalPurchaseValue = motors.reduce((sum, m) => sum + m.harga_beli, 0);
    const potentialMargin = totalInventoryValue - totalPurchaseValue;

    const brandCounts: Record<string, number> = {};
    motors.forEach((m) => {
      brandCounts[m.merek] = (brandCounts[m.merek] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      data: {
        inventory: {
          total: totalMotors,
          available: availableMotors,
          sold: soldMotors,
          available_pct: totalMotors > 0 ? Math.round((availableMotors / totalMotors) * 100) : 0,
          total_inventory_value: totalInventoryValue,
          total_purchase_value: totalPurchaseValue,
          potential_margin: potentialMargin,
          brand_distribution: brandCounts,
        },
        predictions: {
          total_count: predictions.length,
          recent: predictions.slice(0, 5),
        },
        models: MODEL_METRICS,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal mengambil statistik dashboard" },
      { status: 500 }
    );
  }
}
