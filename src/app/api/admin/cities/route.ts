/**
 * @module /api/admin/cities
 *
 * GET  /api/admin/cities — все города (для админки)
 * POST /api/admin/cities — создание города
 */

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugFromTitle } from "@/lib/slugFromTitle";
import { z } from "zod";

async function guard() {
  const session = await auth();
  return session?.user?.role === "ADMIN";
}

const createCitySchema = z.object({
  name: z.string().trim().min(1, "Введите название города").max(100),
  slug: z.string().trim().optional(),
  isActive: z.boolean().optional(),
});

/**
 * Список городов для админ-панели (включая неактивные).
 */
export async function GET(): Promise<Response> {
  if (!(await guard())) return Response.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });

  const cities = await prisma.city.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true, isActive: true },
  });
  return Response.json({ ok: true, cities });
}

/**
 * Создаёт город. Поле `slug` необязательно — генерируется из названия.
 */
export async function POST(request: Request): Promise<Response> {
  if (!(await guard())) return Response.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });

  try {
    const body = await request.json();
    const parsed = createCitySchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { ok: false, error: "VALIDATION_ERROR", details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const { name, slug: slugRaw, isActive } = parsed.data;
    const fromInput = (slugRaw ?? "").trim();
    const slug = (fromInput.length > 0 ? fromInput : slugFromTitle(name)).trim();
    if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
      return Response.json(
        {
          ok: false,
          error: "VALIDATION_ERROR",
          message: "Укажите корректный адрес в ссылке (латиница, цифры, дефисы) или измените название",
        },
        { status: 400 },
      );
    }

    const city = await prisma.city.create({
      data: { name, slug, isActive: isActive ?? true },
      select: { id: true, name: true, slug: true, isActive: true },
    });
    return Response.json({ ok: true, city }, { status: 201 });
  } catch (e: unknown) {
    if (typeof e === "object" && e !== null && "code" in e && (e as { code: string }).code === "P2002") {
      return Response.json({ ok: false, error: "SLUG_TAKEN" }, { status: 409 });
    }
    console.error("[POST /api/admin/cities]", e);
    return Response.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
