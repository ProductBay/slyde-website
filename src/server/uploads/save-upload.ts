import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { resolveUploadPath } from "@/server/uploads/storage";

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;
const allowedMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function sanitizeFileName(fileName: string) {
  const ext = path.extname(fileName).toLowerCase();
  const base = path.basename(fileName, ext).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return `${base || "document"}${ext}`;
}

function isAllowedFileType(file: File) {
  if (allowedMimeTypes.has(file.type)) return true;
  const ext = path.extname(file.name).toLowerCase();
  return [".pdf", ".jpg", ".jpeg", ".png", ".webp"].includes(ext);
}

export async function saveUploadedFile(file: File, storagePrefix: string) {
  if (file.size <= 0) {
    throw new Error(`${file.name}: file is empty.`);
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`${file.name}: file exceeds the 8 MB limit.`);
  }

  if (!isAllowedFileType(file)) {
    throw new Error(`${file.name}: unsupported file type.`);
  }

  const safeFileName = sanitizeFileName(file.name);
  const storageKey = `${storagePrefix}/${crypto.randomUUID()}-${safeFileName}`;
  const absolutePath = resolveUploadPath(storageKey.split("/"));
  await mkdir(path.dirname(absolutePath), { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(absolutePath, buffer);

  return {
    name: file.name,
    size: file.size,
    type: file.type || "application/octet-stream",
    fileUrl: `/uploads/${storageKey}`,
    storageKey,
  };
}
