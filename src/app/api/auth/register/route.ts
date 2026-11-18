import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      message:
        "Pendaftaran akun publik tidak tersedia. Sistem ini dikelola secara eksklusif oleh Admin Showroom Roda.Motorku.",
    },
    { status: 403 }
  );
}
