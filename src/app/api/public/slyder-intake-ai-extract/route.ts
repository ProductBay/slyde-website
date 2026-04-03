import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { z } from "zod";
import { protectPublicRoute } from "@/server/security/public-route-protection";
import { resolveUploadPath } from "@/server/uploads/storage";

const extractRequestSchema = z.object({
  files: z
    .array(
      z.object({
        name: z.string().optional(),
        type: z.string().optional(),
        fileUrl: z.string().optional(),
        storageKey: z.string().optional(),
      }),
    )
    .min(1)
    .max(4),
});

function normalizeKey(input: { storageKey?: string; fileUrl?: string }) {
  if (input.storageKey?.trim()) return input.storageKey.trim().replace(/^\/+/, "");
  if (input.fileUrl?.startsWith("/uploads/")) return input.fileUrl.replace(/^\/uploads\//, "").replace(/^\/+/, "");
  return null;
}

function mimeFromFile(name = "", fallback = "application/octet-stream") {
  const lower = name.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".pdf")) return "application/pdf";
  return fallback;
}

async function fileToDataUrl(file: { storageKey: string; type?: string; name?: string }) {
  const absolutePath = resolveUploadPath(file.storageKey.split("/"));
  const buffer = await readFile(absolutePath);
  const mimeType = (file.type || "").trim() || mimeFromFile(file.name, "application/octet-stream");
  return {
    mimeType,
    dataUrl: `data:${mimeType};base64,${buffer.toString("base64")}`,
  };
}

function parseJsonObjectFromText(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(text.slice(start, end + 1));
    }
    throw new Error("AI response did not contain valid JSON.");
  }
}

export async function POST(request: Request) {
  const protection = await protectPublicRoute(request, {
    routeKey: "public_slyder_intake_ai_extract",
    limit: 10,
    windowMs: 10 * 60 * 1000,
  });
  if (protection) return protection;

  const json = await request.json().catch(() => null);
  const parsed = extractRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const filesWithKeys: Array<{ storageKey: string; type?: string; name?: string }> = [];
  for (const file of parsed.data.files) {
    const key = normalizeKey(file);
    if (!key) continue;
    filesWithKeys.push({
      storageKey: key,
      type: file.type,
      name: file.name,
    });
  }

  if (!filesWithKeys.length) {
    return NextResponse.json({ error: "At least one uploaded file reference is required." }, { status: 400 });
  }

  const openAiKey = process.env.OPENAI_API_KEY?.trim();
  if (!openAiKey) {
    return NextResponse.json(
      {
        error: "AI extraction is not configured on this server.",
        detail: "Set OPENAI_API_KEY to enable OCR and NLP prefill extraction.",
      },
      { status: 503 },
    );
  }

  try {
    const images = await Promise.all(filesWithKeys.map((file) => fileToDataUrl(file)));

    const schema = {
      type: "object",
      additionalProperties: false,
      properties: {
        personal: {
          type: "object",
          additionalProperties: false,
          properties: {
            fullName: { type: "string" },
            dateOfBirth: { type: "string" },
            trn: { type: "string" },
            address: { type: "string" },
          },
        },
        readiness: {
          type: "object",
          additionalProperties: false,
          properties: {
            smartphoneType: { type: "string", enum: ["Android", "iPhone", ""] },
          },
        },
        confidence: { type: "number" },
        extractedSummary: { type: "string" },
      },
      required: ["personal", "readiness", "confidence", "extractedSummary"],
    };

    const model = process.env.OPENAI_VISION_MODEL || "gpt-4.1-mini";

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openAiKey}`,
      },
      body: JSON.stringify({
        model,
        input: [
          {
            role: "system",
            content: [
              {
                type: "input_text",
                text:
                  "You extract onboarding prefill values from uploaded ID/license documents. Return only what is clearly visible. Use empty strings when not visible. Date format must be YYYY-MM-DD if confident.",
              },
            ],
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text:
                  "Extract candidate prefill data for a courier onboarding form. Return strict JSON matching the requested schema.",
              },
              ...images.map((image) => ({
                type: "input_image",
                image_url: image.dataUrl,
              })),
            ],
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "slyder_intake_prefill",
            strict: true,
            schema,
          },
        },
      }),
    });

    const responseJson = (await response.json().catch(() => null)) as
      | {
          output_text?: string;
          error?: { message?: string };
        }
      | null;

    if (!response.ok) {
      return NextResponse.json(
        {
          error: responseJson?.error?.message || "AI extraction request failed.",
        },
        { status: 502 },
      );
    }

    if (!responseJson?.output_text) {
      return NextResponse.json({ error: "AI extraction returned no output." }, { status: 502 });
    }

    const extracted = parseJsonObjectFromText(responseJson.output_text) as {
      personal?: {
        fullName?: string;
        dateOfBirth?: string;
        trn?: string;
        address?: string;
      };
      readiness?: {
        smartphoneType?: "Android" | "iPhone" | "";
      };
      confidence?: number;
      extractedSummary?: string;
    };

    return NextResponse.json(
      {
        ok: true,
        extracted: {
          personal: {
            fullName: extracted.personal?.fullName?.trim() || "",
            dateOfBirth: extracted.personal?.dateOfBirth?.trim() || "",
            trn: extracted.personal?.trn?.trim() || "",
            address: extracted.personal?.address?.trim() || "",
          },
          readiness: {
            smartphoneType: extracted.readiness?.smartphoneType || "",
          },
          confidence: typeof extracted.confidence === "number" ? extracted.confidence : 0,
          extractedSummary: extracted.extractedSummary?.trim() || "",
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to process uploaded files for AI extraction.",
      },
      { status: 400 },
    );
  }
}
