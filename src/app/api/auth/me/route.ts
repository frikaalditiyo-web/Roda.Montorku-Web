import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { findUserById } from "@/lib/repository";

export async function GET(request: NextRequest) {
  try {
    const payload = getAuthenticatedUser(request);

    if (!payload) {
      return NextResponse.json(
        { success: false, authenticated: false, message: "Tidak ada sesi admin yang aktif atau token kedaluwarsa." },
        { status: 401 }
      );
    }

    const user = await findUserById(payload.id_user);
    if (!user) {
      return NextResponse.json(
        { success: false, authenticated: false, message: "Pengguna tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      data: {
        id_user: user.id_user,
        username: user.username,
        nama: user.nama,
        role: user.role,
        created_at: user.created_at,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memverifikasi sesi" },
      { status: 500 }
    );
  }
}
