import { NextResponse } from "next/server";
import { getSessionContext } from "@/server/auth/session";
import { saveUploadedFile } from "@/server/uploads/save-upload";

const AVATAR_COOKIE = "slyde_user_avatar";
const allowedAvatarMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

function hasAllowedAvatarExtension(fileName: string) {
  const lower = fileName.toLowerCase();
  return lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png") || lower.endsWith(".webp");
}

export async function POST(request: Request) {
  const session = await getSessionContext();
  if (!session?.user?.isEnabled) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Avatar file is required" }, { status: 400 });
  }

  if (!allowedAvatarMimeTypes.has(file.type) && !hasAllowedAvatarExtension(file.name)) {
    return NextResponse.json({ error: "Only JPG, PNG, or WEBP images are allowed" }, { status: 400 });
  }

  try {
    const uploaded = await saveUploadedFile(file, `user-avatars/${session.user.id}`);
    const response = NextResponse.json({ ok: true, fileUrl: uploaded.fileUrl }, { status: 201 });

    response.cookies.set(AVATAR_COOKIE, uploaded.fileUrl, {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to upload avatar" },
      { status: 400 },
    );
  }
}
