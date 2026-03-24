import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export async function verifyPassword(password: string, storedHash?: string) {
  if (!storedHash) return false;
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;
  const derived = scryptSync(password, salt, 64);
  return timingSafeEqual(Buffer.from(hash, "hex"), derived);
}
