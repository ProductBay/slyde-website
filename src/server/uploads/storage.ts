import { access } from "node:fs/promises";
import path from "node:path";
import { constants as fsConstants } from "node:fs";

const uploadsRoot = path.join(process.cwd(), ".data", "uploads");

export function getUploadsRoot() {
  return uploadsRoot;
}

export function normalizeUploadPathSegments(segments: string[]) {
  return segments.filter(Boolean).map((segment) => segment.replace(/\\/g, "/"));
}

export function resolveUploadPath(segments: string[]) {
  const normalized = normalizeUploadPathSegments(segments);
  const absolutePath = path.resolve(uploadsRoot, ...normalized);

  if (!absolutePath.startsWith(uploadsRoot)) {
    throw new Error("Invalid upload path");
  }

  return absolutePath;
}

export async function uploadExistsForUrl(fileUrl: string) {
  if (!fileUrl.startsWith("/uploads/")) return false;

  const relativePath = fileUrl.replace(/^\/uploads\//, "");
  const absolutePath = resolveUploadPath(relativePath.split("/"));

  try {
    await access(absolutePath, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}
