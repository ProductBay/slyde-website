import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getLocalAdminFallbackContext, requireAdminContext } from "@/server/auth/guards";
import { getUploadsRoot, normalizeUploadPathSegments, resolveUploadPath } from "@/server/uploads/storage";

function contentTypeForFile(filePath: string) {
  const extension = path.extname(filePath).toLowerCase();

  switch (extension) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".pdf":
      return "application/pdf";
    default:
      return "application/octet-stream";
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  let adminContext = await requireAdminContext();

  if (adminContext instanceof NextResponse) {
    const requestUrl = new URL(request.url);
    const fallbackContext = await getLocalAdminFallbackContext(requestUrl.searchParams.get("admin_key"));
    if (fallbackContext) {
      adminContext = fallbackContext;
    }
  }

  if (adminContext instanceof NextResponse) return adminContext;

  const { path: pathSegments } = await context.params;

  try {
    const safeSegments = normalizeUploadPathSegments(pathSegments);
    const absolutePath = resolveUploadPath(safeSegments);
    const file = await readFile(absolutePath);

    return new NextResponse(file, {
      headers: {
        "Content-Type": contentTypeForFile(absolutePath),
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch {
    return new NextResponse(
      [
        "Document file not available",
        "",
        "This upload path exists in the onboarding record, but the file is not stored on this local server.",
        "These older SLYDE applications were saved with metadata-only document placeholders before server-side upload storage was connected.",
        "",
        `Expected storage root: ${getUploadsRoot()}`,
      ].join("\n"),
      {
        status: 410,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
