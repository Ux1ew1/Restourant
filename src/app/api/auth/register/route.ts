import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth.schema";

/**
 * @module /api/auth/register
 *
 * Регистрация нового пользователя.
 *
 * POST /api/auth/register — создаёт пользователя с ролью USER.
 */

/**
 * Регистрирует пользователя по email + password (+ опционально name/phone).
 *
 * Коды ответа:
 * - 201: создано
 * - 400: невалидные данные
 * - 409: email уже зарегистрирован
 * - 500: ошибка сервера
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const json = await request.json().catch(() => null);
    const parsed = registerSchema.safeParse(json);

    if (!parsed.success) {
      return Response.json(
        { ok: false, error: "VALIDATION_ERROR", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { email, password, name, phone } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) {
      return Response.json({ ok: false, error: "EMAIL_EXISTS" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name?.trim() || null,
        phone: phone?.trim() || null,
        role: "USER",
      },
      select: { id: true, email: true, name: true, phone: true, role: true, createdAt: true },
    });

    return Response.json({ ok: true, user }, { status: 201 });
  } catch (e) {
    console.error(e);
    return Response.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}

