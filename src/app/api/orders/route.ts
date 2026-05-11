/**
 * @module /api/orders
 *
 * POST /api/orders — создание нового заказа.
 */

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkoutSchema } from "@/lib/validations/checkout.schema";

/** Элемент корзины, который клиент передаёт при оформлении */
interface CartLineInput {
  productId: string;
  quantity: number;
  wishes?: string;
}

/**
 * Создаёт заказ в базе данных.
 *
 * Принимает форму оформления заказа и список позиций корзины.
 * Цены фиксируются из базы данных (не доверяем клиентским ценам).
 * Пользователь может быть не авторизован — `userId` будет null.
 *
 * @param request - Next.js Request с JSON-телом `{ form, venueId, items }`
 * @returns JSON `{ ok, orderId }` или объект с ошибкой
 *
 * Коды ответа:
 * - 201: Заказ создан
 * - 400: Ошибка валидации или пустая корзина
 * - 404: Заведение не найдено
 * - 500: Ошибка сервера
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const session = await auth();
    const userId = session?.user?.id ?? null;

    const body = await request.json();
    const { venueId, items, form } = body as {
      venueId?: string;
      items?: CartLineInput[];
      form?: unknown;
    };

    if (!venueId) {
      return Response.json({ ok: false, error: "VENUE_ID_REQUIRED" }, { status: 400 });
    }

    if (!items || items.length === 0) {
      return Response.json({ ok: false, error: "CART_EMPTY" }, { status: 400 });
    }

    const parsed = checkoutSchema.safeParse(form);
    if (!parsed.success) {
      return Response.json(
        { ok: false, error: "VALIDATION_ERROR", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const venue = await prisma.venue.findUnique({
      where: { id: venueId, isActive: true },
      select: { id: true },
    });
    if (!venue) {
      return Response.json({ ok: false, error: "VENUE_NOT_FOUND" }, { status: 404 });
    }

    const productIds = items.map((it) => it.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds }, venueId, isHidden: false, isStopList: false },
      select: { id: true, price: true },
    });

    if (dbProducts.length !== productIds.length) {
      return Response.json({ ok: false, error: "PRODUCT_UNAVAILABLE" }, { status: 400 });
    }

    const priceMap = new Map(dbProducts.map((p) => [p.id, p.price]));

    const orderItems = items.map((it) => ({
      productId: it.productId,
      quantity: Math.max(1, Math.floor(it.quantity)),
      price: priceMap.get(it.productId)!,
      wishes: it.wishes?.trim() || null,
    }));

    const totalPrice = orderItems.reduce((sum, it) => sum + it.price * it.quantity, 0);

    const data = parsed.data;

    let address: string | null = null;
    if (data.type === "delivery") {
      const parts = [data.street, `д. ${data.house}`];
      if (data.buildingType === "apartment") {
        if (data.flat) parts.push(`кв. ${data.flat}`);
        if (data.intercom) parts.push(`домофон: ${data.intercom}`);
      }
      address = parts.join(", ");
    }

    let deliveryTime: Date | null = null;
    if (data.deliveryTimeType === "scheduled" && data.scheduledTime) {
      deliveryTime = new Date(data.scheduledTime);
    }

    const order = await prisma.order.create({
      data: {
        userId,
        venueId,
        type: data.type,
        status: "new",
        totalPrice,
        address,
        phone: data.phone.trim(),
        paymentMethod: data.paymentMethod,
        changeFrom: data.paymentMethod === "cash" ? (data.changeFrom ?? null) : null,
        deliveryTime,
        comment: data.comment?.trim() || null,
        items: {
          create: orderItems,
        },
      },
      select: { id: true },
    });

    return Response.json({ ok: true, orderId: order.id }, { status: 201 });
  } catch (e) {
    console.error("[POST /api/orders]", e);
    return Response.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
