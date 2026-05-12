/**
 * @module /api/admin/upload
 *
 * POST /api/admin/upload — загрузка изображения с клиента с ресайзом/сжатием.
 */

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import sharp from "sharp";

import { auth } from "@/lib/auth";

export const runtime = "nodejs";

type UploadTarget = "banner" | "menu" | "venue";

const TARGET_CONFIG: Record<UploadTarget, { maxWidth: number; maxHeight: number; quality: number }> = {
  // Широкий баннер, приоритет деталям
  banner: { maxWidth: 1920, maxHeight: 1080, quality: 78 },
  // Фото блюд: средний размер, выше качество
  menu: { maxWidth: 1280, maxHeight: 1280, quality: 80 },
  // Логотип/фото заведения: компактнее
  venue: { maxWidth: 800, maxHeight: 800, quality: 75 },
};

async function guard() {
  const session = await auth();
  return session?.user?.role === "ADMIN";
}

/**
 * Принимает multipart/form-data:
 * - file: File
 * - target: "banner" | "menu" | "venue"
 */
export async function POST(request: Request): Promise<Response> {
  if (!(await guard())) return Response.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });

  try {
    const form = await request.formData();
    const file = form.get("file");
    const targetRaw = form.get("target");
    if (!(file instanceof File)) {
      return Response.json({ ok: false, error: "FILE_REQUIRED" }, { status: 400 });
    }

    const target = (typeof targetRaw === "string" ? targetRaw : "") as UploadTarget;
    if (!(target in TARGET_CONFIG)) {
      return Response.json({ ok: false, error: "INVALID_TARGET" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return Response.json({ ok: false, error: "INVALID_FILE_TYPE" }, { status: 400 });
    }
    if (file.size > 15 * 1024 * 1024) {
      return Response.json({ ok: false, error: "FILE_TOO_LARGE" }, { status: 413 });
    }

    const { maxWidth, maxHeight, quality } = TARGET_CONFIG[target];
    const raw = Buffer.from(await file.arrayBuffer());

    const optimized = await sharp(raw)
      .rotate()
      .resize({
        width: maxWidth,
        height: maxHeight,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality, effort: 4 })
      .toBuffer();

    const fileName = `${Date.now()}-${randomUUID()}.webp`;
    const relativeDir = join("uploads", target);
    const absoluteDir = join(process.cwd(), "public", relativeDir);
    await mkdir(absoluteDir, { recursive: true });
    await writeFile(join(absoluteDir, fileName), optimized);

    return Response.json({
      ok: true,
      url: `/${relativeDir.replaceAll("\\", "/")}/${fileName}`,
      bytes: optimized.length,
    });
  } catch (e) {
    console.error("[POST /api/admin/upload]", e);
    return Response.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
