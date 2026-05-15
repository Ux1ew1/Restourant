import { z } from "zod";

/** Требуемый формат телефона: `+7 (000) 999-12-12` */
export const PHONE_MASK_EXAMPLE = "+7 (000) 999-12-12";

const PHONE_PATTERN = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;

export function formatPhoneInput(value: string) {
  const digits = value.replace(/\D/g, "");

  if (digits.length === 0) {
    return "";
  }

  const localDigits = digits.replace(/^[78]/, "").slice(0, 10);

  if (localDigits.length === 0) {
    return "+7 (";
  }

  const areaCode = localDigits.slice(0, 3);
  const prefix = localDigits.slice(3, 6);
  const firstPair = localDigits.slice(6, 8);
  const secondPair = localDigits.slice(8, 10);

  let formatted = `+7 (${areaCode}`;

  if (localDigits.length >= 3) {
    formatted += ")";
  }

  if (prefix.length > 0) {
    formatted += ` ${prefix}`;
  }

  if (firstPair.length > 0) {
    formatted += `-${firstPair}`;
  }

  if (secondPair.length > 0) {
    formatted += `-${secondPair}`;
  }

  return formatted;
}

/**
 * Обязательный телефон в формате `+7 (000) 999-12-12`.
 */
export function requiredPhoneSchema(message = `Введите телефон в формате ${PHONE_MASK_EXAMPLE}`) {
  return z.string().trim().regex(PHONE_PATTERN, message);
}

/**
 * Необязательный телефон в формате `+7 (000) 999-12-12`.
 * Пустая строка допускается.
 */
export function optionalPhoneSchema(message = `Введите телефон в формате ${PHONE_MASK_EXAMPLE}`) {
  return z
    .string()
    .trim()
    .refine((value) => value.length === 0 || PHONE_PATTERN.test(value), message);
}
