import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Logout berhasil. Sesi telah diakhiri.",
  });

  // Clear cookie
  response.cookies.set({
    name: "rodamotorku_token",
    value: "",
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  return response;
}
