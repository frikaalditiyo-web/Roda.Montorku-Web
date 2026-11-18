import { NextRequest, NextResponse } from "next/server";
import { findUserByUsername } from "@/lib/repository";
import { verifyPassword, signJwt } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const username = (body.username || "").trim();
    const password = (body.password || "").trim();

    if (!username || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Username dan kata sandi wajib diisi.",
        },
        { status: 400 }
      );
    }

    const user = await findUserByUsername(username);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Kredensial tidak valid. Username tidak ditemukan.",
        },
        { status: 401 }
      );
    }

    const isMatch = verifyPassword(password, user.password_hash);
    if (!isMatch) {
      return NextResponse.json(
        {
          success: false,
          message: "Kata sandi yang Anda masukkan salah.",
        },
        { status: 401 }
      );
    }

    // Sign JWT Token
    const token = signJwt({
      id_user: user.id_user,
      username: user.username,
      nama: user.nama,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      message: "Login berhasil. Selamat datang kembali!",
      data: {
        token,
        user: {
          id_user: user.id_user,
          username: user.username,
          nama: user.nama,
          role: user.role,
          created_at: user.created_at,
        },
      },
    });

    // Set secure HttpOnly cookie
    response.cookies.set({
      name: "rodamotorku_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memproses login" },
      { status: 500 }
    );
  }
}
