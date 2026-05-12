import { z } from "zod";
import { optionalPhoneSchema } from "@/lib/validations/phone";

/**
 * Схема регистрации пользователя.
 *
 * Пароль валидируем минимально на этапе 2, чтобы не блокировать UX.
 * Более строгие правила (сложность/подтверждение) можно добавить позже.
 */
export const registerSchema = z.object({
  name: z.string().trim().min(1, "Введите имя").max(100, "Слишком длинное имя").optional(),
  email: z.string().trim().toLowerCase().email("Некорректный email"),
  phone: optionalPhoneSchema().optional(),
  password: z.string().min(8, "Минимум 8 символов").max(72, "Слишком длинный пароль"),
});

/** Схема входа пользователя по email + паролю. */
export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Некорректный email"),
  password: z.string().min(1, "Введите пароль"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

