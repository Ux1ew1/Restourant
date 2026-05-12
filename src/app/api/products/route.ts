import { prisma } from "@/lib/prisma";
import { jsonWithPublicCache } from "@/lib/http-cache";

export const revalidate = 60;
export const dynamic = "force-dynamic";

/**
 * @module /api/products
 *
 * GET /api/products?venueId=&category= — список товаров заведения; `category` — slug категории (опционально).
 */

/**
 * Возвращает публичный список товаров заведения.
 *
 * Скрытые позиции (`isHidden=true`) не включаются. Параметр `category` — slug категории
 * в рамках заведения; при неверном slug возвращается пустой массив (без 404).
 *
 * @param request - Next.js Request
 * @returns JSON `{ ok, products }` или объект с ошибкой
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
    const categorySlug = url.searchParams.get("category");

    if (!venueId) {
      return Response.json({ ok: false, error: "VENUE_ID_REQUIRED" }, { status: 400 });
    }

    let categoryId: string | undefined;
    if (categorySlug) {
      const cat = await prisma.category.findFirst({
        where: { venueId, slug: categorySlug, isActive: true },
        select: { id: true },
      });
      if (!cat) {
        return jsonWithPublicCache({ ok: true, products: [] });
      }
      categoryId = cat.id;
    }

    const products = await prisma.product.findMany({
      where: {
        venueId,
        isHidden: false,
        ...(categoryId ? { categoryId } : {}),
      },
      orderBy: [{ category: { sortOrder: "asc" } }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
        weight: true,
        price: true,
        isStopList: true,
        isHidden: true,
        categoryId: true,
        category: {
          select: { id: true, name: true, slug: true, sortOrder: true },
        },
      },
    });

    return jsonWithPublicCache({ ok: true, products });
  } catch (e) {
    console.error(e);
    return Response.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
