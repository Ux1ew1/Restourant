import { getPublicProductById } from "@/lib/public-product";

/**
 * @module /api/products/[id]
 *
 * GET /api/products/[id] — публичная карточка товара по id.
 */

/**
 * Возвращает данные товара для страницы детали и клиентских запросов.
 *
 * Коды ответа:
 * - 200: Успешно
 * - 404: Не найден или скрыт (`isHidden`)
 * - 500: Ошибка сервера
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    const { id } = await context.params;
    const product = await getPublicProductById(id);

    if (!product) {
      return Response.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
    }

    return Response.json({ ok: true, product });
  } catch (e) {
    console.error(e);
    return Response.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
