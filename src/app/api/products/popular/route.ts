import { prisma } from "@/lib/prisma";

/**
 * @module /api/products/popular
 *
 * GET /api/products/popular?venueId= — популярные позиции заведения для главной страницы.
 */

/**
 * Возвращает товары из списка популярных (`PopularProduct`) для указанного заведения.
 *
 * Скрытые позиции (`isHidden`) не попадают в ответ — на главной показывается только публичное меню.
 * Позиции в стоп-листе возвращаются с флагом `isStopList`, чтобы UI мог отключить заказ.
 *
 * @param request - Next.js Request
 * @returns JSON `{ ok, products }` или объект с ошибкой
 *
 * Коды ответа:
 * - 200: Успешно (возможен пустой массив)
 * - 400: Не передан `venueId`
 * - 500: Ошибка сервера
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const venueId = url.searchParams.get("venueId");

    if (!venueId) {
      return Response.json({ ok: false, error: "VENUE_ID_REQUIRED" }, { status: 400 });
    }

    const rows = await prisma.popularProduct.findMany({
      where: { venueId },
      orderBy: { sortOrder: "asc" },
      select: {
        sortOrder: true,
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            imageUrl: true,
            weight: true,
            price: true,
            isHidden: true,
            isStopList: true,
            venueId: true,
          },
        },
      },
    });

    const products = rows
      .map((r) => r.product)
      .filter((p) => !p.isHidden)
      .map(({ id, name, slug, imageUrl, weight, price, isStopList }) => ({
        id,
        name,
        slug,
        imageUrl,
        weight,
        price,
        isStopList,
      }));

    return Response.json({ ok: true, products });
  } catch (e) {
    console.error(e);
    return Response.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
