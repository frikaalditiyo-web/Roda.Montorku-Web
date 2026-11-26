import { NextRequest, NextResponse } from "next/server";
import { getAllMotors, createMotor } from "@/lib/repository";
import { getAuthenticatedUser } from "@/lib/auth";
import { serializeMotorForViewer } from "@/lib/motorSerializer";
import type { FotoMotor, Motor } from "@/data/mockShowroomData";

const ALLOWED_BRANDS = ["Honda", "Yamaha", "Suzuki", "Kawasaki", "Vespa"] as const;
const ALLOWED_STATUS = ["Tersedia", "Terjual"] as const;

export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthenticatedUser(request);
    const isAdmin = Boolean(authUser && authUser.role === "admin");

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const brand = searchParams.get("brand") || undefined;
    const year = searchParams.get("year") || undefined;
    const priceRange = searchParams.get("priceRange") || undefined;
    const status = searchParams.get("status") || undefined;
    const pageRaw = searchParams.get("page");
    const limitRaw = searchParams.get("limit");
    const page = pageRaw ? parseInt(pageRaw, 10) : undefined;
    const limit = limitRaw ? parseInt(limitRaw, 10) : undefined;

    const result = await getAllMotors({
      search,
      brand,
      year,
      priceRange,
      status,
      page: page && !isNaN(page) ? page : undefined,
      limit: limit && !isNaN(limit) ? Math.min(limit, 2000) : undefined,
    });

    return NextResponse.json({
      success: true,
      data: result.data.map((m) => serializeMotorForViewer(m, isAdmin)),
      pagination: result.pagination,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch motors";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthenticatedUser(request);
    if (!authUser || authUser.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Akses ditolak. Sesi admin aktif diperlukan untuk menambah motor.",
        },
        { status: 401 }
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

    const merekRaw = String(body.merek || "").trim();
    const tipe = String(body.tipe || "").trim();
    const tahunNum = Number(body.tahun);
    const ccNum = body.cc !== undefined ? Number(body.cc) : 125;
    const kmNum = body.kilometer !== undefined ? Number(body.kilometer) : 10000;
    const hargaBeliNum = Number(body.harga_beli);
    const hargaJualNum = Number(body.harga_jual);
    const statusRaw = String(body.status || "Tersedia");

    if (!merekRaw || !tipe || !body.tahun || !body.harga_beli || !body.harga_jual) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Data wajib tidak lengkap (merek, tipe, tahun, harga_beli, harga_jual).",
        },
        { status: 400 }
      );
    }

    const merek =
      ALLOWED_BRANDS.find((b) => b.toLowerCase() === merekRaw.toLowerCase()) ||
      "Honda";

    if (isNaN(tahunNum) || tahunNum < 1990 || tahunNum > 2030) {
      return NextResponse.json(
        {
          success: false,
          message: "Tahun pembuatan tidak valid (harus antara 1990 - 2030).",
        },
        { status: 400 }
      );
    }

    if (isNaN(ccNum) || ccNum < 50 || ccNum > 2000) {
      return NextResponse.json(
        { success: false, message: "Kapasitas mesin (CC) harus antara 50 - 2000." },
        { status: 400 }
      );
    }

    if (isNaN(kmNum) || kmNum < 0) {
      return NextResponse.json(
        { success: false, message: "Kilometer tidak boleh negatif." },
        { status: 400 }
      );
    }

    if (
      isNaN(hargaBeliNum) ||
      hargaBeliNum <= 0 ||
      isNaN(hargaJualNum) ||
      hargaJualNum <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Harga beli dan harga jual harus berupa angka positif lebih dari 0.",
        },
        { status: 400 }
      );
    }

    const status = ALLOWED_STATUS.includes(statusRaw as Motor["status"])
      ? (statusRaw as Motor["status"])
      : "Tersedia";

    const rawPhotos = Array.isArray(body.foto_motor) ? body.foto_motor : [];
    const foto_motor: FotoMotor[] = rawPhotos
      .filter((f): f is Record<string, unknown> => Boolean(f && typeof f === "object" && (f as Record<string, unknown>).nama_file))
      .map((f, idx) => ({
        id_foto: Number(f.id_foto) || Date.now() + idx,
        id_motor: 0,
        nama_file: String(f.nama_file),
        label: String(f.label || `Foto #${idx + 1}`),
        caption: String(f.caption || `${merek} ${tipe}`),
        is_utama: idx === 0 ? Boolean(f.is_utama ?? true) : Boolean(f.is_utama),
      }));

    if (foto_motor.length > 0 && !foto_motor.some((p) => p.is_utama)) {
      foto_motor[0].is_utama = true;
    }

    const created = await createMotor({
      id_user: authUser.id_user,
      sku:
        String(body.sku || "").trim() ||
        `RDK-${String(tahunNum).slice(-2)}-${merek.slice(0, 3).toUpperCase()}-AG`,
      nopol: String(body.nopol || "AG 1234 XXX").trim().toUpperCase(),
      merek,
      tipe,
      tahun: tahunNum,
      cc: ccNum,
      kilometer: kmNum,
      kondisi_mesin: String(body.kondisi_mesin || "Baik"),
      kelengkapan_dokumen: String(body.kelengkapan_dokumen || "Lengkap (STNK + BPKB)"),
      domisili_samsat: String(body.domisili_samsat || "Nganjuk (AG)"),
      pajak_info: String(body.pajak_info || "Pajak aktif"),
      harga_beli: hargaBeliNum,
      harga_jual: hargaJualNum,
      harga_pasar_coret: body.harga_pasar_coret
        ? Number(body.harga_pasar_coret)
        : undefined,
      deskripsi: String(body.deskripsi || "Kondisi terawat siap pakai."),
      status,
      foto_motor,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Motor berhasil ditambahkan ke katalog",
        data: serializeMotorForViewer(created, true),
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to create motor";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
