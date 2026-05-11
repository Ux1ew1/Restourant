/**
 * @module /api/admin/venues
 *
 * GET  /api/admin/venues — все заведения (с городами)
 * POST /api/admin/venues — создание заведения
 */

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

async function guard() {
  const session = await auth();
  return session?.user?.role === "ADMIN";
}

const venueSchema = z.object({
  cityId: z.string().min(1, "Выберите город"),
  name: z.string().trim().min(1, "Введите название").max(200),
  slug: z.string().trim().min(1).regex(/^[a-z0-9-]+$/),
  address: z.string().trim().min(1, "Введите адрес").max(300),
  phone: z.string().trim().max(30).optional(),
  logoUrl: z.string().trim().url().optional().or(z.literal("")),
  isActive: z.boolean().optional(),
});

export async function GET(): Promise<Response> {
  if (!(await guard())) return Response.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });

  const venues = await prisma.venue.findMany({
    orderBy: [{ city: { name: "asc" } }, { name: "asc" }],
    select: {
      id: true, name: true, slug: true, address: true,
      phone: true, logoUrl: true, isActive: true,
      city: { select: { id: true, name: true, slug: true } },
    },
  });
  return Response.json({ ok: true, venues });
}

export async function POST(request: Request): Promise<Response> {
  if (!(await guard())) return Response.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });

  try {
    const body = await request.json();
    const parsed = venueSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ ok: false, error: "VALIDATION_ERROR", details: parsed.error.flatten() }, { status: 400 });
    }
    const d = parsed.data;
    const venue = await prisma.venue.create({
      data: {
        cityId: d.cityId, name: d.name, slug: d.slug, address: d.address,
        phone: d.phone || null, logoUrl: d.logoUrl || null, isActive: d.isActive ?? true,
      },
      select: { id: true, name: true, slug: true },
    });
    return Response.json({ ok: true, venue }, { status: 201 });
  } catch (e) {
    console.error("[POST /api/admin/venues]", e);
    return Response.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}

/**
 * Обновляет поля существующего заведения.
 *
 * Принимает `id` заведения вместе с обновляемыми полями.
 * Поддерживает частичное обновление (только `isActive`) и полное редактирование.
 *
 * Коды ответа:
 * - 200: Обновлено
 * - 400: Ошибка валидации
 * - 403: Не ADMIN
 * - 404: Заведение не найдено
 * - 500: Ошибка сервера
 */
export async function PATCH(request: Request): Promise<Response> {
  if (!(await guard())) return Response.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });

  try {
    const body = await request.json();
    const { id, ...rest } = body as { id?: string; [key: string]: unknown };

    if (!id) {
      return Response.json({ ok: false, error: "ID_REQUIRED" }, { status: 400 });
    }

    const existing = await prisma.venue.findUnique({ where: { id }, select: { id: true } });
    if (!existing) {
      return Response.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
    }

    // Быстрый тоггл isActive (без полной валидации формы)
    if (Object.keys(rest).length === 1 && typeof rest.isActive === "boolean") {
      const venue = await prisma.venue.update({
        where: { id },
        data: { isActive: rest.isActive },
        select: { id: true, isActive: true },
      });
      return Response.json({ ok: true, venue });
    }

    // Полное обновление через venueSchema
    const parsed = venueSchema.safeParse(rest);
    if (!parsed.success) {
      return Response.json(
        { ok: false, error: "VALIDATION_ERROR", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const d = parsed.data;
    const venue = await prisma.venue.update({
      where: { id },
      data: {
        cityId: d.cityId,
        name: d.name,
        slug: d.slug,
        address: d.address,
        phone: d.phone || null,
        logoUrl: d.logoUrl || null,
        isActive: d.isActive ?? true,
      },
      select: { id: true, name: true, slug: true, logoUrl: true, isActive: true },
    });

    return Response.json({ ok: true, venue });
  } catch (e) {
    console.error("[PATCH /api/admin/venues]", e);
    return Response.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
