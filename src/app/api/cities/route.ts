import { prisma } from "@/lib/prisma";

/**
 * @module /api/cities
 *
 * GET /api/cities — возвращает список активных городов.
 */

/** Возвращает список активных городов. */
export async function GET(): Promise<Response> {
  try {
    const cities = await prisma.city.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true, isActive: true },
    });

    return Response.json({ ok: true, cities });
  } catch (e) {
    console.error(e);
    return Response.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}

