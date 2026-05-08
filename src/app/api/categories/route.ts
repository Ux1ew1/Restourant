import { prisma } from "@/lib/prisma";

/**
 * @module /api/categories
 *
 * GET /api/categories?venueId= — активные категории меню заведения (для навигации на главной и странице меню).
 */

/**
 * Возвращает активные категории заведения, отсортированные по `sortOrder`, затем по имени.
 *
 * @param request - Next.js Request
 * @returns JSON `{ ok, categories }` или объект с ошибкой
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

    const categories = await prisma.category.findMany({
      where: { venueId, isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        sortOrder: true,
      },
    });

    return Response.json({ ok: true, categories });
  } catch (e) {
    console.error(e);
    return Response.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
