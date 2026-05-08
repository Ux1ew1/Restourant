import { prisma } from "@/lib/prisma";

/**
 * @module /api/news
 *
 * GET /api/news?venueId= — активные новости и акции для заведения (включая общие без привязки к точке).
 */

/**
 * Возвращает список активных новостных баннеров для витрины главной страницы.
 *
 * В выборку попадают элементы с `isActive=true` и `publishedAt` в прошлом или «сейчас»,
 * у которых `venueId` совпадает с запросом **или** `venueId` равен `null` (общая акция).
 * Сортировка: сначала более свежие публикации.
 *
 * @param request - Next.js Request
 * @returns JSON `{ ok, news }` или объект с ошибкой
 *
 * Коды ответа:
 * - 200: Успешно
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

    const now = new Date();

    const news = await prisma.newsItem.findMany({
      where: {
        isActive: true,
        publishedAt: { lte: now },
        OR: [{ venueId }, { venueId: null }],
      },
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        content: true,
        publishedAt: true,
        venueId: true,
      },
    });

    return Response.json({ ok: true, news });
  } catch (e) {
    console.error(e);
    return Response.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
