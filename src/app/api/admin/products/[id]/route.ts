/**
 * @module /api/admin/products/[id]
 *
 * GET    /api/admin/products/[id] — получить товар
 * PATCH  /api/admin/products/[id] — обновить товар
 * DELETE /api/admin/products/[id] — удалить товар
 */

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations/product.schema";

async function guard() {
  const session = await auth();
  return session?.user?.role === "ADMIN";
}

/**
 * Возвращает товар по id — для заполнения формы редактирования.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  if (!(await guard())) return Response.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });

  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true, name: true, slug: true, description: true,
      imageUrl: true, weight: true, composition: true, price: true,
      isHidden: true, isStopList: true, categoryId: true, venueId: true,
      category: { select: { id: true, name: true } },
    },
  });
  if (!product) return Response.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
  return Response.json({ ok: true, product });
}

/**
 * Обновляет поля товара.
 *
 * Поддерживает частичное обновление: если передан только `isHidden` или `isStopList` — обновляет только их.
 * Цена передаётся в рублях и сохраняется в копейках.
 *
 * Коды ответа:
 * - 200: Обновлено
 * - 400: Ошибка валидации
 * - 403: Не ADMIN
 * - 404: Товар не найден
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  if (!(await guard())) return Response.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });

  try {
    const { id } = await params;
    const body = await request.json() as Record<string, unknown>;

    const existing = await prisma.product.findUnique({ where: { id }, select: { id: true, venueId: true } });
    if (!existing) return Response.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });

    // Быстрые тогглы (isHidden / isStopList) без полной валидации
    if (Object.keys(body).length <= 2 && ("isHidden" in body || "isStopList" in body)) {
      const updated = await prisma.product.update({
        where: { id },
        data: {
          ...(typeof body.isHidden === "boolean" ? { isHidden: body.isHidden } : {}),
          ...(typeof body.isStopList === "boolean" ? { isStopList: body.isStopList } : {}),
        },
        select: { id: true, isHidden: true, isStopList: true },
      });
      return Response.json({ ok: true, product: updated });
    }

    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { ok: false, error: "VALIDATION_ERROR", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const d = parsed.data;
    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: d.name,
        slug: d.slug,
        description: d.description || null,
        imageUrl: d.imageUrl || null,
        weight: d.weight || null,
        composition: d.composition || null,
        price: d.price * 100,
        categoryId: d.categoryId,
        isHidden: d.isHidden ?? false,
        isStopList: d.isStopList ?? false,
      },
      select: { id: true, name: true, slug: true },
    });

    return Response.json({ ok: true, product: updated });
  } catch (e) {
    console.error("[PATCH /api/admin/products/[id]]", e);
    return Response.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}

/**
 * Удаляет товар. Если товар связан с заказами — вернёт ошибку от БД (Restrict).
 *
 * Коды ответа:
 * - 200: Удалено
 * - 403: Не ADMIN
 * - 404: Товар не найден
 * - 409: Товар используется в заказах — удаление невозможно
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  if (!(await guard())) return Response.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });

  try {
    const { id } = await params;
    const existing = await prisma.product.findUnique({ where: { id }, select: { id: true } });
    if (!existing) return Response.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });

    await prisma.product.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("Restrict")) {
      return Response.json({ ok: false, error: "PRODUCT_IN_USE" }, { status: 409 });
    }
    console.error("[DELETE /api/admin/products/[id]]", e);
    return Response.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
