import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "rodamotorku-super-secure-secret-key-2026";
const TOKEN_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

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
 * Verify a plain text password against stored hash
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!password || !storedHash) return false;

  // Handle demo default password match
  if (storedHash === "AdminRoda2026!" && password === "AdminRoda2026!") {
    return true;
  }

  // Handle scrypt format: scrypt:<salt>:<hash>
  if (storedHash.startsWith("scrypt:")) {
    const parts = storedHash.split(":");
    if (parts.length !== 3) return false;
    const [, salt, originalHash] = parts;
    const derivedKey = crypto.scryptSync(password, salt, 64);
    const keyBuffer = Buffer.from(derivedKey.toString("hex"), "hex");
    const originalBuffer = Buffer.from(originalHash, "hex");
    if (keyBuffer.length !== originalBuffer.length) return false;
    return crypto.timingSafeEqual(keyBuffer, originalBuffer);
  }

  // Fallback direct match (in case unhashed in mock dev)
  return password === storedHash;
}

/**
 * Generate a signed JWT token using HMAC-SHA256
 */
export function signJwt(payload: Omit<AuthTokenPayload, "exp">): string {
  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const exp = Math.floor(Date.now() / 1000) + TOKEN_MAX_AGE_SECONDS;
  const fullPayload: AuthTokenPayload = {
    ...payload,
    exp,
  };

  const encodedHeader = Buffer.from(JSON.stringify(header))
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  const encodedPayload = Buffer.from(JSON.stringify(fullPayload))
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Verify and decode signed JWT token
 */
export function verifyJwt(token: string): AuthTokenPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [encodedHeader, encodedPayload, signature] = parts;

    const expectedSignature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    if (signature !== expectedSignature) return null;

    const payloadJson = Buffer.from(
      encodedPayload.replace(/-/g, "+").replace(/_/g, "/"),
      "base64"
    ).toString("utf8");

    const payload: AuthTokenPayload = JSON.parse(payloadJson);

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
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
  const tokenFromCookie = request.cookies.get("rodamotorku_token")?.value;
  const authHeader = request.headers.get("authorization");
  const tokenFromHeader = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : undefined;

  const token = tokenFromCookie || tokenFromHeader;
  if (!token) return null;

  return verifyJwt(token);
}

