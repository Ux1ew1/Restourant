/**
 * @module /api/admin/categories
 *
 * GET  /api/admin/categories?venueId= — список категорий
 * POST /api/admin/categories — создание категории
 */

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

async function guard() {
  const session = await auth();
  return session?.user?.role === "ADMIN";
}

const categorySchema = z.object({
  name: z.string().trim().min(1, "Введите название").max(100),
  slug: z
    .string()
    .trim()
    .min(1, "Введите slug")
    .regex(/^[a-z0-9-]+$/, "Только строчные латинские буквы, цифры и дефисы"),
  sortOrder: z.coerce.number().int().min(0).optional(),
});

export async function GET(request: Request): Promise<Response> {
  if (!(await guard())) return Response.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });

  const url = new URL(request.url);
  const venueId = url.searchParams.get("venueId");
  if (!venueId) return Response.json({ ok: false, error: "VENUE_ID_REQUIRED" }, { status: 400 });

  const categories = await prisma.category.findMany({
    where: { venueId },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true, slug: true, sortOrder: true, isActive: true, venueId: true },
  });
  return Response.json({ ok: true, categories });
}

export async function POST(request: Request): Promise<Response> {
  if (!(await guard())) return Response.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });

  try {
    const body = await request.json();
    const { venueId, ...rest } = body as { venueId?: string; [key: string]: unknown };
    if (!venueId) return Response.json({ ok: false, error: "VENUE_ID_REQUIRED" }, { status: 400 });

    const parsed = categorySchema.safeParse(rest);
    if (!parsed.success) {
      return Response.json({ ok: false, error: "VALIDATION_ERROR", details: parsed.error.flatten() }, { status: 400 });
    }

    const exists = await prisma.category.findUnique({
      where: { venueId_slug: { venueId, slug: parsed.data.slug } },
      select: { id: true },
    });
    if (exists) return Response.json({ ok: false, error: "SLUG_TAKEN" }, { status: 400 });

    const category = await prisma.category.create({
      data: { venueId, name: parsed.data.name, slug: parsed.data.slug, sortOrder: parsed.data.sortOrder ?? 0 },
      select: { id: true, name: true, slug: true, sortOrder: true },
    });
    return Response.json({ ok: true, category }, { status: 201 });
  } catch (e) {
    console.error("[POST /api/admin/categories]", e);
    return Response.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
