import { prisma } from "@/lib/prisma";
import { jsonWithPublicCache } from "@/lib/http-cache";

export const revalidate = 60;
export const dynamic = "force-dynamic";

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

    return jsonWithPublicCache({ ok: true, cities });
  } catch (e) {
    console.error(e);
    return Response.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
