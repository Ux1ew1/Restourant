import { prisma } from "@/lib/prisma";
import { jsonWithPublicCache } from "@/lib/http-cache";

export const revalidate = 60;
export const dynamic = "force-dynamic";

/**
 * @module /api/venues
 *
 * GET /api/venues?cityId= — возвращает активные заведения выбранного города.
 */

/**
 * Возвращает список заведений по городу.
 *
 * Коды ответа:
 * - 200: Успешно
 * - 400: Не передан cityId
 * - 500: Ошибка сервера
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const cityId = url.searchParams.get("cityId");

    if (!cityId) {
      return Response.json({ ok: false, error: "CITY_ID_REQUIRED" }, { status: 400 });
    }

    const venues = await prisma.venue.findMany({
      where: { cityId, isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        cityId: true,
        address: true,
        phone: true,
        logoUrl: true,
        isActive: true,
        storyEnabled: true,
        storyTitle: true,
        storyText: true,
        bookingEnabled: true,
      },
    });

    return jsonWithPublicCache({ ok: true, venues });
  } catch (e) {
    console.error(e);
    return Response.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
