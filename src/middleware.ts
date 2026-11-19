import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface DecodedPayload {
  id_user: number;
  username: string;
  role: string;
  exp: number;
}

function parseTokenPayload(token: string): DecodedPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonStr = atob(base64);
    const payload = JSON.parse(jsonStr);

    const now = Math.floor(Date.now() / 1000);
    if (!payload.exp || payload.exp < now) {
      return null; // Expired
    }

    if (payload.role !== "admin") {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("rodamotorku_token")?.value;
  const validPayload = token ? parseTokenPayload(token) : null;

  // Protect all /admin routes
  if (pathname.startsWith("/admin")) {
    if (!validPayload) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      const response = NextResponse.redirect(loginUrl);
      if (token && !validPayload) {
        // Clear invalid/expired cookie
        response.cookies.delete("rodamotorku_token");
      }
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
