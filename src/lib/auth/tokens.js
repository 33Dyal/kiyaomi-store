import jwt from "jsonwebtoken";
import crypto from "crypto";
import { env } from "@/lib/env";

/**
 * Access tokens: short-lived, carry { sub, role }, verified on every
 * protected request. Never contain secrets, never trusted for role checks
 * without re-verifying signature + expiry server-side.
 *
 * Refresh tokens: long-lived, opaque random string. Only its SHA-256 hash
 * is stored in the DB (RefreshToken.tokenHash) so a DB leak alone can't be
 * used to mint sessions. Presented refresh tokens are rotated (old one
 * revoked, new one issued) on every use.
 */

export function signAccessToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, env.JWT_SECRET, {
    expiresIn: env.JWT_ACCESS_TTL,
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_SECRET); // throws on invalid/expired
}

export function generateRefreshToken() {
  const raw = crypto.randomBytes(48).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(raw).digest("hex");
  const expiresAt = new Date(Date.now() + ttlToMs(env.JWT_REFRESH_TTL));
  return { raw, tokenHash, expiresAt };
}

export function hashRefreshToken(raw) {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

function ttlToMs(ttl) {
  const match = /^(\d+)([smhd])$/.exec(ttl);
  if (!match) return 30 * 24 * 60 * 60 * 1000;
  const value = Number(match[1]);
  const unit = { s: 1000, m: 60000, h: 3600000, d: 86400000 }[match[2]];
  return value * unit;
}
