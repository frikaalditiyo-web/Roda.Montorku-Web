import crypto from "crypto";

export const COOKIE_NAME = "rodamotorku_token";

const DEV_FALLBACK_JWT_SECRET = "rodamotorku-dev-only-jwt-secret-change-in-prod";
const TOKEN_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

function getJwtSecret(): string {
  const envSecret = process.env.JWT_SECRET?.trim();
  if (envSecret && envSecret.length >= 16) {
    return envSecret;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "JWT_SECRET environment variable must be configured with >= 16 characters in production."
    );
  }
  return DEV_FALLBACK_JWT_SECRET;
}

export interface AuthTokenPayload {
  id_user: number;
  username: string;
  nama: string;
  role: string;
  exp: number;
}

/**
 * Hash a password using scrypt with random salt
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `scrypt:${salt}:${derivedKey.toString("hex")}`;
}

/**
 * Verify a plain text password against stored scrypt hash
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!password || !storedHash) return false;

  if (storedHash.startsWith("scrypt:")) {
    const parts = storedHash.split(":");
    if (parts.length !== 3) return false;
    const [, salt, originalHash] = parts;
    try {
      const derivedKey = crypto.scryptSync(password, salt, 64);
      const originalBuffer = Buffer.from(originalHash, "hex");
      if (derivedKey.length !== originalBuffer.length) return false;
      return crypto.timingSafeEqual(derivedKey, originalBuffer);
    } catch {
      return false;
    }
  }

  // Legacy plaintext compatibility only if unhashed record exists
  return password === storedHash;
}

function toBase64Url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

/**
 * Generate a signed JWT token using HMAC-SHA256
 */
export function signJwt(
  payload: Omit<AuthTokenPayload, "exp">,
  maxAgeSeconds = TOKEN_MAX_AGE_SECONDS
): string {
  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const exp = Math.floor(Date.now() / 1000) + maxAgeSeconds;
  const fullPayload: AuthTokenPayload = {
    ...payload,
    exp,
  };

  const encodedHeader = toBase64Url(JSON.stringify(header));
  const encodedPayload = toBase64Url(JSON.stringify(fullPayload));

  const signature = crypto
    .createHmac("sha256", getJwtSecret())
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Verify HMAC-SHA256 signature (constant-time) and decode signed JWT token
 */
export function verifyJwt(token: string): AuthTokenPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [encodedHeader, encodedPayload, signature] = parts;

    const expectedSignature = crypto
      .createHmac("sha256", getJwtSecret())
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    const sigBuf = Buffer.from(signature, "utf8");
    const expBuf = Buffer.from(expectedSignature, "utf8");
    if (
      sigBuf.length !== expBuf.length ||
      !crypto.timingSafeEqual(sigBuf, expBuf)
    ) {
      return null;
    }

    const payloadJson = Buffer.from(
      encodedPayload.replace(/-/g, "+").replace(/_/g, "/"),
      "base64"
    ).toString("utf8");

    const payload: AuthTokenPayload = JSON.parse(payloadJson);

    const now = Math.floor(Date.now() / 1000);
    if (!payload.exp || payload.exp < now) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Extract authenticated user from request cookie or Authorization header
 */
export function getAuthenticatedUser(request: {
  cookies: { get(name: string): { value: string } | undefined };
  headers: { get(name: string): string | null };
}): AuthTokenPayload | null {
  const tokenFromCookie = request.cookies.get(COOKIE_NAME)?.value;
  const authHeader = request.headers.get("authorization");
  const tokenFromHeader = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : undefined;

  const token = tokenFromCookie || tokenFromHeader;
  if (!token) return null;

  return verifyJwt(token);
}
