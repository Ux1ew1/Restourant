/**
 * @module /api/admin/orders
 *
 * GET /api/admin/orders?venueId=&status=&page= — список заказов для администратора.
 */

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 20;

/**
 * Возвращает постранично список заказов с фильтрацией по заведению и статусу.
 *
 * Доступен только пользователям с ролью ADMIN.
 *
 * @param request - Next.js Request
 * @returns JSON `{ ok, orders, total, page }` или ошибка
 *
 * Коды ответа:
 * - 200: Успешно
 * - 403: Не ADMIN
 * - 500: Ошибка сервера
 */
export async function GET(request: Request): Promise<Response> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return Response.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });
  }

  try {
    const url = new URL(request.url);
    const venueId = url.searchParams.get("venueId") || undefined;
    const status = url.searchParams.get("status") || undefined;
    const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));

    const where = {
      ...(venueId ? { venueId } : {}),
      ...(status ? { status } : {}),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
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
          venue: { select: { id: true, name: true } },
          user: { select: { id: true, name: true, email: true, phone: true } },
          items: {
            select: {
              id: true,
              quantity: true,
              price: true,
              wishes: true,
              product: { select: { id: true, name: true, imageUrl: true, weight: true } },
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return Response.json({ ok: true, orders, total, page, pageSize: PAGE_SIZE });
  } catch (e) {
    console.error("[GET /api/admin/orders]", e);
    return Response.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
