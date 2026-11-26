import { NextRequest, NextResponse } from "next/server";
import {
  getPredictionById,
  updatePrediction,
  deletePrediction,
} from "@/lib/repository";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = getAuthenticatedUser(request);
    if (!authUser || authUser.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Akses ditolak. Sesi admin diperlukan." },
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

    const pred = await getPredictionById(predId);
    if (!pred) {
      return NextResponse.json(
        { success: false, message: "Prediksi tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: pred });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to get prediction";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

async function handleUpdate(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = getAuthenticatedUser(request);
    if (!authUser || authUser.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Akses ditolak. Sesi admin aktif diperlukan untuk mengubah riwayat prediksi.",
        },
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

    let body: { harga_estimasi?: number; catatan_simulasi?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Format payload JSON tidak valid." },
        { status: 400 }
      );
    }

    const updates: { harga_estimasi?: number; catatan_simulasi?: string } = {};

    if (body.harga_estimasi !== undefined) {
      const harga = Number(body.harga_estimasi);
      if (isNaN(harga) || harga <= 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Harga estimasi harus berupa angka positif lebih dari 0.",
          },
          { status: 400 }
        );
      }
      updates.harga_estimasi = harga;
    }

    if (body.catatan_simulasi !== undefined) {
      updates.catatan_simulasi = String(body.catatan_simulasi).slice(0, 255);
    }

    const updated = await updatePrediction(predId, updates);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Riwayat prediksi tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Riwayat prediksi berhasil diperbarui",
      data: updated,
    });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Failed to update prediction";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

export const PUT = handleUpdate;
export const PATCH = handleUpdate;

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = getAuthenticatedUser(request);
    if (!authUser || authUser.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Akses ditolak. Sesi admin aktif diperlukan untuk menghapus riwayat prediksi.",
        },
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
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Failed to delete prediction";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
