/**
 * @module /api/admin/news
 *
 * GET  /api/admin/news?venueId= — список новостных баннеров
 * POST /api/admin/news — создание баннера
 */

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

async function guard() {
  const session = await auth();
  return session?.user?.role === "ADMIN";
}

const newsSchema = z.object({
  title: z.string().trim().min(1, "Введите заголовок").max(200),
  imageUrl: z.string().trim().url("Некорректный URL").optional().or(z.literal("")),
  content: z.string().trim().max(2000).optional(),
  isActive: z.boolean().optional(),
  venueId: z.string().optional(),
});

export async function GET(request: Request): Promise<Response> {
  if (!(await guard())) return Response.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });

  const url = new URL(request.url);
  const venueId = url.searchParams.get("venueId") || undefined;

  const items = await prisma.newsItem.findMany({
    where: venueId ? { venueId } : {},
    orderBy: { publishedAt: "desc" },
    select: { id: true, title: true, imageUrl: true, content: true, isActive: true, publishedAt: true, venueId: true },
  });
  return Response.json({ ok: true, items });
}

export async function POST(request: Request): Promise<Response> {
  if (!(await guard())) return Response.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });

  try {
    const body = await request.json();
    const parsed = newsSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ ok: false, error: "VALIDATION_ERROR", details: parsed.error.flatten() }, { status: 400 });
    }
    const d = parsed.data;
    const item = await prisma.newsItem.create({
      data: {
        title: d.title,
        imageUrl: d.imageUrl || null,
        content: d.content || null,
        isActive: d.isActive ?? true,
        venueId: d.venueId || null,
      },
      select: { id: true, title: true },
    });
    return Response.json({ ok: true, item }, { status: 201 });
  } catch (e) {
    console.error("[POST /api/admin/news]", e);
    return Response.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
