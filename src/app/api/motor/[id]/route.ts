import { NextRequest, NextResponse } from "next/server";
import { getMotorById, updateMotor, deleteMotor } from "@/lib/repository";
import { getAuthenticatedUser } from "@/lib/auth";
import { serializeMotorForViewer } from "@/lib/motorSerializer";
import type { FotoMotor, Motor } from "@/data/mockShowroomData";

const ALLOWED_BRANDS = ["Honda", "Yamaha", "Suzuki", "Kawasaki", "Vespa"] as const;
const ALLOWED_STATUS = ["Tersedia", "Terjual"] as const;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = getAuthenticatedUser(request);
    const isAdmin = Boolean(authUser && authUser.role === "admin");

    const { id } = await params;
    const motorId = parseInt(id, 10);
    if (isNaN(motorId)) {
      return NextResponse.json(
        { success: false, message: "ID motor tidak valid" },
        { status: 400 }
      );
    }

    const motor = await getMotorById(motorId);
    if (!motor) {
      return NextResponse.json(
        { success: false, message: "Motor tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: serializeMotorForViewer(motor, isAdmin),
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to get motor";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

export async function PUT(
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
            "Akses ditolak. Sesi admin aktif diperlukan untuk mengubah data motor.",
        },
        { status: 401 }
      );
    }

    const { id } = await params;
    const motorId = parseInt(id, 10);
    if (isNaN(motorId)) {
      return NextResponse.json(
        { success: false, message: "ID motor tidak valid" },
        { status: 400 }
      );
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Format payload JSON tidak valid." },
        { status: 400 }
      );
    }

    // Strict allow-list prevents mass assignment of immutable columns (id_motor, id_user, created_at, views_week)
    const sanitized: Partial<Motor> = {};

    if (body.merek !== undefined) {
      const mStr = String(body.merek).trim();
      const matched = ALLOWED_BRANDS.find(
        (b) => b.toLowerCase() === mStr.toLowerCase()
      );
      if (!matched) {
        return NextResponse.json(
          { success: false, message: "Merek motor tidak valid." },
          { status: 400 }
        );
      }
      sanitized.merek = matched;
    }
    if (body.tipe !== undefined) {
      const tipe = String(body.tipe).trim();
      if (!tipe) {
        return NextResponse.json(
          { success: false, message: "Tipe motor tidak boleh kosong." },
          { status: 400 }
        );
      }
      sanitized.tipe = tipe;
    }
    if (body.nopol !== undefined) sanitized.nopol = String(body.nopol).trim().toUpperCase();
    if (body.sku !== undefined) sanitized.sku = String(body.sku).trim();
    if (body.tahun !== undefined) {
      const t = Number(body.tahun);
      if (isNaN(t) || t < 1990 || t > 2030) {
        return NextResponse.json(
          { success: false, message: "Tahun tidak valid (1990 - 2030)." },
          { status: 400 }
        );
      }
      sanitized.tahun = t;
    }
    if (body.cc !== undefined) {
      const cc = Number(body.cc);
      if (isNaN(cc) || cc < 50 || cc > 2000) {
        return NextResponse.json(
          { success: false, message: "Kapasitas CC tidak valid (50 - 2000)." },
          { status: 400 }
        );
      }
      sanitized.cc = cc;
    }
    if (body.kilometer !== undefined) {
      const km = Number(body.kilometer);
      if (isNaN(km) || km < 0) {
        return NextResponse.json(
          { success: false, message: "Kilometer tidak boleh negatif." },
          { status: 400 }
        );
      }
      sanitized.kilometer = km;
    }
    if (body.harga_beli !== undefined) {
      const hb = Number(body.harga_beli);
      if (isNaN(hb) || hb <= 0) {
        return NextResponse.json(
          { success: false, message: "Harga beli harus lebih dari 0." },
          { status: 400 }
        );
      }
      sanitized.harga_beli = hb;
    }
    if (body.harga_jual !== undefined) {
      const hj = Number(body.harga_jual);
      if (isNaN(hj) || hj <= 0) {
        return NextResponse.json(
          { success: false, message: "Harga jual harus lebih dari 0." },
          { status: 400 }
        );
      }
      sanitized.harga_jual = hj;
    }
    if (body.harga_pasar_coret !== undefined) {
      const hpc = Number(body.harga_pasar_coret);
      if (!isNaN(hpc) && hpc > 0) sanitized.harga_pasar_coret = hpc;
    }
    if (body.kondisi_mesin !== undefined) sanitized.kondisi_mesin = String(body.kondisi_mesin);
    if (body.kelengkapan_dokumen !== undefined) sanitized.kelengkapan_dokumen = String(body.kelengkapan_dokumen);
    if (body.domisili_samsat !== undefined) sanitized.domisili_samsat = String(body.domisili_samsat);
    if (body.pajak_info !== undefined) sanitized.pajak_info = String(body.pajak_info);
    if (body.deskripsi !== undefined) sanitized.deskripsi = String(body.deskripsi);
    if (body.status !== undefined) {
      const st = String(body.status);
      if (!ALLOWED_STATUS.includes(st as Motor["status"])) {
        return NextResponse.json(
          { success: false, message: "Status harus 'Tersedia' atau 'Terjual'." },
          { status: 400 }
        );
      }
      sanitized.status = st as Motor["status"];
    }
    if (Array.isArray(body.foto_motor)) {
      const mappedPhotos: FotoMotor[] = body.foto_motor
        .filter((f): f is Record<string, unknown> => Boolean(f && typeof f === "object" && (f as Record<string, unknown>).nama_file))
        .map((f, idx) => ({
          id_foto: Number(f.id_foto) || Date.now() + idx,
          id_motor: motorId,
          nama_file: String(f.nama_file),
          label: String(f.label || `Foto #${idx + 1}`),
          caption: String(f.caption || ""),
          is_utama: Boolean(f.is_utama),
        }));
      if (mappedPhotos.length > 0 && !mappedPhotos.some((p) => p.is_utama)) {
        mappedPhotos[0].is_utama = true;
      }
      sanitized.foto_motor = mappedPhotos;
    }

    const updated = await updateMotor(motorId, sanitized);

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Motor tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Data motor berhasil diperbarui",
      data: serializeMotorForViewer(updated, true),
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update motor";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

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
            "Akses ditolak. Sesi admin aktif diperlukan untuk menghapus motor.",
        },
        { status: 401 }
      );
    }

    const { id } = await params;
    const motorId = parseInt(id, 10);
    if (isNaN(motorId)) {
      return NextResponse.json(
        { success: false, message: "ID motor tidak valid" },
        { status: 400 }
      );
    }

    const deleted = await deleteMotor(motorId);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Motor tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Motor berhasil dihapus dari inventaris",
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to delete motor";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
