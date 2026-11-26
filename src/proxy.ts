import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJwt, COOKIE_NAME } from "@/lib/auth";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const payload = token ? verifyJwt(token) : null;
  const isAdmin = Boolean(payload && payload.role === "admin");

  if (pathname.startsWith("/admin")) {
    if (!isAdmin) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      const response = NextResponse.redirect(loginUrl);
      if (token) {
        // Clear tampered or expired cookie
        response.cookies.delete(COOKIE_NAME);
      }
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
