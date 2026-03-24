import { createHash, randomBytes } from "node:crypto";

export function generateOpaqueToken(length = 24) {
  return randomBytes(length).toString("hex");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function generateOtpCode() {
  return `${Math.floor(100000 + Math.random() * 900000)}`;
}
