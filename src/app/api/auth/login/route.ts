import { NextRequest, NextResponse } from "next/server";
import { findUserByUsername } from "@/lib/repository";
import { verifyPassword, signJwt, COOKIE_NAME } from "@/lib/auth";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5;

type AttemptBucket = { count: number; resetAt: number };

const globalForRateLimit = globalThis as unknown as {
  loginAttempts?: Map<string, AttemptBucket>;
};

function getAttemptStore(): Map<string, AttemptBucket> {
  if (!globalForRateLimit.loginAttempts) {
    globalForRateLimit.loginAttempts = new Map();
  }
  return globalForRateLimit.loginAttempts;
}

function getClientKey(request: NextRequest, username: string): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "local";
  return `${ip}:${username.toLowerCase()}`;
}

function checkRateLimit(key: string): { limited: boolean; retryAfterSec: number } {
  const store = getAttemptStore();
  const now = Date.now();
  const entry = store.get(key);
  if (!entry) return { limited: false, retryAfterSec: 0 };
  if (now >= entry.resetAt) {
    store.delete(key);
    return { limited: false, retryAfterSec: 0 };
  }
  if (entry.count >= MAX_FAILED_ATTEMPTS) {
    return {
      limited: true,
      retryAfterSec: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
    };
  }
  return { limited: false, retryAfterSec: 0 };
}

function recordFailedAttempt(key: string) {
  const store = getAttemptStore();
  const now = Date.now();
  // Prune expired buckets lazily so map never grows unbounded
  if (store.size > 500) {
    for (const [k, v] of store.entries()) {
      if (now >= v.resetAt) store.delete(k);
    }
  }
  const existing = store.get(key);
  if (!existing || now >= existing.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    existing.count += 1;
  }
}

export async function POST(request: NextRequest) {
  try {
    let body: { username?: string; password?: string; rememberMe?: boolean };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Format payload JSON tidak valid." },
        { status: 400 }
      );
    }

    const username = String(body.username || "").trim();
    const password = String(body.password || "").trim();
    const rememberMe = body.rememberMe !== false;

    if (!username || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Username dan kata sandi wajib diisi.",
        },
        { status: 400 }
      );
    }

    const rateKey = getClientKey(request, username);
    const rateStatus = checkRateLimit(rateKey);
    if (rateStatus.limited) {
      return NextResponse.json(
        {
          success: false,
          message: `Terlalu banyak percobaan login gagal. Coba lagi dalam ${Math.ceil(rateStatus.retryAfterSec / 60)} menit.`,
        },
        {
          status: 429,
          headers: { "Retry-After": String(rateStatus.retryAfterSec) },
        }
      );
    }

    const user = await findUserByUsername(username);
    if (!user) {
      recordFailedAttempt(rateKey);
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
      recordFailedAttempt(rateKey);
      return NextResponse.json(
        {
          success: false,
          message: "Kata sandi yang Anda masukkan salah.",
        },
        { status: 401 }
      );
    }

    getAttemptStore().delete(rateKey);

    const maxAgeSeconds = rememberMe ? 7 * 24 * 60 * 60 : 12 * 60 * 60;
    const token = signJwt(
      {
        id_user: user.id_user,
        username: user.username,
        nama: user.nama,
        role: user.role,
      },
      maxAgeSeconds
    );

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

    const isHttps =
      request.headers.get("x-forwarded-proto") === "https" ||
      request.nextUrl.protocol === "https:";

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: isHttps,
      sameSite: "lax",
      ...(rememberMe ? { maxAge: maxAgeSeconds } : {}),
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal memproses login";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
