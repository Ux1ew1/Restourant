/**
 * @module /api/admin/orders/[id]
 *
 * PATCH /api/admin/orders/[id] — обновление статуса заказа.
 */

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

/** Допустимые статусы заказа и их переходы */
export const ORDER_STATUSES = ["new", "accepted", "in_progress", "delivering", "done", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

const patchSchema = z.object({
  status: z.enum(ORDER_STATUSES),
});

/**
 * Обновляет статус заказа.
 *
 * @param request - Next.js Request с JSON-телом `{ status }`
 * @param params - Параметры маршрута: `id` заказа
 * @returns JSON `{ ok, order }` или ошибка
 *
 * Коды ответа:
 * - 200: Статус обновлён
 * - 400: Некорректный статус
 * - 403: Не ADMIN
 * - 404: Заказ не найден
 * - 500: Ошибка сервера
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return Response.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { ok: false, error: "VALIDATION_ERROR", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const existing = await prisma.order.findUnique({ where: { id }, select: { id: true } });
    if (!existing) {
      return Response.json({ ok: false, error: "ORDER_NOT_FOUND" }, { status: 404 });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status: parsed.data.status },
      select: { id: true, status: true },
    });

    return Response.json({ ok: true, order });
  } catch (e) {
    console.error("[PATCH /api/admin/orders/[id]]", e);
    return Response.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
