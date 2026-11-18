import { NextRequest, NextResponse } from "next/server";
import { getAllMotors, createMotor } from "@/lib/repository";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const brand = searchParams.get("brand") || undefined;
    const year = searchParams.get("year") || undefined;
    const priceRange = searchParams.get("priceRange") || undefined;
    const status = searchParams.get("status") || undefined;
    const page = searchParams.get("page")
      ? parseInt(searchParams.get("page")!, 10)
      : undefined;
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!, 10)
      : undefined;

    const result = await getAllMotors({
      search,
      brand,
      year,
      priceRange,
      status,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch motors" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthenticatedUser(request);
    if (!authUser || authUser.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Akses ditolak. Sesi admin aktif diperlukan untuk menambah motor." },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Basic validation
    if (!body.merek || !body.tipe || !body.tahun || !body.harga_beli || !body.harga_jual) {
      return NextResponse.json(
        {
          success: false,
          message: "Data wajib tidak lengkap (merek, tipe, tahun, harga_beli, harga_jual).",
        },
        { status: 400 }
      );
    }

    const tahunNum = Number(body.tahun);
    const hargaBeliNum = Number(body.harga_beli);
    const hargaJualNum = Number(body.harga_jual);

    if (isNaN(tahunNum) || tahunNum < 1990 || tahunNum > 2030) {
      return NextResponse.json(
        { success: false, message: "Tahun pembuatan tidak valid (harus antara 1990 - 2030)." },
        { status: 400 }
      );
    }

    if (isNaN(hargaBeliNum) || hargaBeliNum <= 0 || isNaN(hargaJualNum) || hargaJualNum <= 0) {
      return NextResponse.json(
        { success: false, message: "Harga beli dan harga jual harus berupa angka positif lebih dari 0." },
        { status: 400 }
      );
    }

    const created = await createMotor({
      id_user: body.id_user || 1,
      sku: body.sku || `RDK-${String(body.tahun).slice(-2)}-${body.tipe.split(" ")[0].toUpperCase()}`,
      nopol: body.nopol || "B 1234 XXX",
      merek: body.merek,
      tipe: body.tipe,
      tahun: Number(body.tahun),
      cc: Number(body.cc) || 125,
      kilometer: Number(body.kilometer) || 10000,
      kondisi_mesin: body.kondisi_mesin || "Baik",
      kelengkapan_dokumen: body.kelengkapan_dokumen || "Lengkap (STNK + BPKB)",
      domisili_samsat: body.domisili_samsat || "Jakarta",
      pajak_info: body.pajak_info || "Pajak aktif",
      harga_beli: Number(body.harga_beli),
      harga_jual: Number(body.harga_jual),
      harga_pasar_coret: body.harga_pasar_coret ? Number(body.harga_pasar_coret) : undefined,
      deskripsi: body.deskripsi || "Kondisi terawat siap pakai.",
      status: body.status || "Tersedia",
      foto_motor: body.foto_motor || [],
    });

    return NextResponse.json(
      {
        success: true,
        message: "Motor berhasil ditambahkan ke katalog",
        data: created,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create motor" },
      { status: 500 }
    );
  }
}
