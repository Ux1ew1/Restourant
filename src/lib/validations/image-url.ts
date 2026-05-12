import { z } from "zod";

/**
 * Проверяет URL изображения:
 * - абсолютный адрес (`https://...`)
 * - или локальный путь загруженного файла (`/uploads/...`)
 * - или пустая строка
 */
export function imageUrlSchema(message = "Некорректный URL изображения") {
  return z
    .string()
    .trim()
    .refine(
      (value) =>
        value.length === 0 ||
        value.startsWith("/uploads/") ||
        /^https?:\/\/.+/i.test(value),
      message,
    );
}
