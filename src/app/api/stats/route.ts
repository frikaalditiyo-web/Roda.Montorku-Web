import { NextRequest, NextResponse } from "next/server";
import { getDashboardStats } from "@/lib/repository";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthenticatedUser(request);
    if (!authUser || authUser.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Akses ditolak. Sesi admin diperlukan untuk melihat ringkasan analitik.",
        },
        { status: 401 }
      );
    }

    const data = await getDashboardStats();

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: unknown) {
    const msg =
      error instanceof Error
        ? error.message
        : "Gagal mengambil statistik dashboard";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
