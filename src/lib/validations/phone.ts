import { z } from "zod";

/** Требуемый формат телефона: `+7 999 999 12 34` */
export const PHONE_MASK_EXAMPLE = "+7 999 999 12 34";

const PHONE_PATTERN = /^\+7 \d{3} \d{3} \d{2} \d{2}$/;

/**
 * Обязательный телефон в формате `+7 999 999 12 34`.
 */
export function requiredPhoneSchema(message = `Введите телефон в формате ${PHONE_MASK_EXAMPLE}`) {
  return z.string().trim().regex(PHONE_PATTERN, message);
}

/**
 * Необязательный телефон в формате `+7 999 999 12 34`.
 * Пустая строка допускается.
 */
export function optionalPhoneSchema(message = `Введите телефон в формате ${PHONE_MASK_EXAMPLE}`) {
  return z
    .string()
    .trim()
    .refine((value) => value.length === 0 || PHONE_PATTERN.test(value), message);
}
