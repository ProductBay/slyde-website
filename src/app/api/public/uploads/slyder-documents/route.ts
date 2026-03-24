import { NextResponse } from "next/server";
import { getUploadsRoot } from "@/server/uploads/storage";
import { saveUploadedFile } from "@/server/uploads/save-upload";
import { protectPublicRoute } from "@/server/security/public-route-protection";

const MAX_FILES_PER_REQUEST = 5;

export async function POST(request: Request) {
  const protection = await protectPublicRoute(request, {
    routeKey: "public_slyder_uploads",
    limit: 20,
    windowMs: 10 * 60 * 1000,
  });
  if (protection) return protection;

  const formData = await request.formData();
  const files = formData.getAll("files").filter((entry): entry is File => entry instanceof File);

  if (files.length === 0) {
    return NextResponse.json({ error: "At least one file is required." }, { status: 400 });
  }

  if (files.length > MAX_FILES_PER_REQUEST) {
    return NextResponse.json({ error: `You can upload up to ${MAX_FILES_PER_REQUEST} files at a time.` }, { status: 400 });
  }

  try {
    const uploaded = await Promise.all(
      files.map(async (file) => {
        return saveUploadedFile(file, `slyder-intake/${new Date().toISOString().slice(0, 10)}`);
      }),
    );

    return NextResponse.json({ ok: true, files: uploaded, root: getUploadsRoot() }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to store uploaded document." },
      { status: 400 },
    );
  }
}
