import { NextRequest, NextResponse } from "next/server";
import { seedAllDatasetMotors } from "@/lib/repository";
import { getAuthenticatedUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthenticatedUser(request);
    if (!authUser || authUser.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Akses ditolak. Sesi admin aktif diperlukan untuk menjalankan seed dataset.",
        },
        { status: 401 }
      );
    }

    const totalImported = await seedAllDatasetMotors();

    return NextResponse.json({
      success: true,
      message: `Berhasil mengimpor dan men-seed ${totalImported} unit motor riil dari dataset Capstone ke basis data!`,
      total_imported: totalImported,
    });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Gagal melakukan seeding dataset";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
