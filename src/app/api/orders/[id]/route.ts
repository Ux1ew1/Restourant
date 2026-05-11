/**
 * @module /api/orders/[id]
 *
 * GET /api/orders/[id] — получение заказа по идентификатору.
 */

import { prisma } from "@/lib/prisma";

/**
 * Возвращает детальную информацию о заказе вместе с позициями и товарами.
 *
 * Доступен без авторизации: клиент получает ссылку сразу после оформления.
 * Намеренно не возвращаем userId, чтобы не раскрывать личные данные по открытому id.
 *
 * @param _request - Next.js Request
 * @param params - Параметры маршрута: `id` — идентификатор заказа
 * @returns JSON `{ ok, order }` или объект с ошибкой
 *
 * Коды ответа:
 * - 200: Успешно
 * - 404: Заказ не найден
 * - 500: Ошибка сервера
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        type: true,
        status: true,
        totalPrice: true,
        address: true,
        phone: true,
        paymentMethod: true,
        changeFrom: true,
        deliveryTime: true,
        comment: true,
        createdAt: true,
        venue: {
          select: { id: true, name: true, address: true, phone: true },
        },
        items: {
          select: {
            id: true,
            quantity: true,
            price: true,
            wishes: true,
            product: {
              select: { id: true, name: true, imageUrl: true, weight: true },
            },
          },
        },
      },
    });

    if (!order) {
      return Response.json({ ok: false, error: "ORDER_NOT_FOUND" }, { status: 404 });
    }

    return Response.json({ ok: true, order });
  } catch (e) {
    console.error("[GET /api/orders/[id]]", e);
    return Response.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
