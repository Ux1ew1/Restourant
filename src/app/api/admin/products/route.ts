/**
 * @module /api/admin/products
 *
 * GET /api/admin/products?venueId= — список товаров (включая скрытые)
 * POST /api/admin/products — создание нового товара
 */

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations/product.schema";

async function guard() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return false;
  return true;
}

/**
 * Возвращает полный список товаров заведения, включая скрытые и стоп-лист.
 *
 * @param request - Next.js Request; query-param `venueId` обязателен
 * @returns JSON `{ ok, products }`
 */
export async function GET(request: Request): Promise<Response> {
  if (!(await guard())) return Response.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });

  try {
    const url = new URL(request.url);
    const venueId = url.searchParams.get("venueId");
    if (!venueId) return Response.json({ ok: false, error: "VENUE_ID_REQUIRED" }, { status: 400 });

    const products = await prisma.product.findMany({
      where: { venueId },
      orderBy: [{ category: { sortOrder: "asc" } }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
        weight: true,
        composition: true,
        price: true,
        isHidden: true,
        isStopList: true,
        categoryId: true,
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    return Response.json({ ok: true, products });
  } catch (e) {
    console.error("[GET /api/admin/products]", e);
    return Response.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}

/**
 * Создаёт новый товар для заведения.
 *
 * Цена в теле запроса — в рублях (целое число); сохраняется в копейках (×100).
 *
 * @param request - Next.js Request с JSON-телом (ProductFormData + venueId)
 * @returns JSON `{ ok, product }` с кодом 201
 *
 * Коды ответа:
 * - 201: Товар создан
 * - 400: Ошибка валидации или slug занят
 * - 403: Не ADMIN
 * - 500: Ошибка сервера
 */
export async function POST(request: Request): Promise<Response> {
  if (!(await guard())) return Response.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });

  try {
    const body = await request.json();
    const { venueId, ...rest } = body as { venueId?: string; [key: string]: unknown };
    if (!venueId) return Response.json({ ok: false, error: "VENUE_ID_REQUIRED" }, { status: 400 });

    const parsed = productSchema.safeParse(rest);
    if (!parsed.success) {
      return Response.json(
        { ok: false, error: "VALIDATION_ERROR", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const d = parsed.data;

    const exists = await prisma.product.findUnique({
      where: { venueId_slug: { venueId, slug: d.slug } },
      select: { id: true },
    });
    if (exists) {
      return Response.json({ ok: false, error: "SLUG_TAKEN" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        venueId,
        categoryId: d.categoryId,
        name: d.name,
        slug: d.slug,
        description: d.description || null,
        imageUrl: d.imageUrl || null,
        weight: d.weight || null,
        composition: d.composition || null,
        price: d.price * 100,
        isHidden: d.isHidden ?? false,
        isStopList: d.isStopList ?? false,
      },
      select: { id: true, name: true, slug: true },
    });

    return Response.json({ ok: true, product }, { status: 201 });
  } catch (e) {
    console.error("[POST /api/admin/products]", e);
    return Response.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
