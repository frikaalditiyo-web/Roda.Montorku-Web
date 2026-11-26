import { NextRequest, NextResponse } from "next/server";
import { linkPredictionToMotor, getMotorById } from "@/lib/repository";
import { getAuthenticatedUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthenticatedUser(request);
    if (!authUser || authUser.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Akses ditolak. Sesi admin aktif diperlukan untuk menautkan prediksi." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const id_prediksi = Number(body.id_prediksi);
    const id_motor = Number(body.id_motor);

    if (!id_prediksi || !id_motor) {
      return NextResponse.json(
        { success: false, message: "id_prediksi dan id_motor wajib diisi" },
        { status: 400 }
      );
    }

    const motor = await getMotorById(id_motor);
    if (!motor) {
      return NextResponse.json(
        { success: false, message: "Motor tidak ditemukan" },
        { status: 404 }
      );
    }

    const updated = await linkPredictionToMotor(id_prediksi, motor);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Prediksi tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Prediksi berhasil dihubungkan ke unit motor katalog",
      data: updated,
    });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Failed to link prediction";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
