"use client";

export type UploadTarget = "banner" | "menu" | "venue";

/**
 * Загружает файл изображения в админ API и возвращает публичный URL.
 *
 * @param file - Выбранный пользователем файл
 * @param target - Профиль сжатия/размера (баннер, меню, логотип заведения)
 * @returns URL сохранённого изображения в `/uploads/...`
 */
export async function uploadAdminImage(file: File, target: UploadTarget): Promise<string> {
  const body = new FormData();
  body.set("file", file);
  body.set("target", target);

  const res = await fetch("/api/admin/upload", {
    method: "POST",
    body,
  });

  const json = (await res.json()) as { ok: boolean; url?: string; error?: string };
  if (!res.ok || !json.ok || !json.url) {
    throw new Error(json.error ?? "UPLOAD_FAILED");
  }
  return json.url;
}
