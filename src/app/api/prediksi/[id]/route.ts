import { NextRequest, NextResponse } from "next/server";
import { deletePrediction } from "@/lib/repository";
import { getAuthenticatedUser } from "@/lib/auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = getAuthenticatedUser(request);
    if (!authUser || authUser.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Akses ditolak. Sesi admin aktif diperlukan untuk menghapus riwayat prediksi." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const predId = parseInt(id, 10);
    if (isNaN(predId)) {
      return NextResponse.json(
        { success: false, message: "ID prediksi tidak valid" },
        { status: 400 }
      );
    }

    const deleted = await deletePrediction(predId);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Prediksi tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Riwayat prediksi berhasil dihapus",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete prediction" },
      { status: 500 }
    );
  }
}
