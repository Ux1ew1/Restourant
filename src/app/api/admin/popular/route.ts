/**
 * @module /api/admin/popular
 *
 * GET    /api/admin/popular?venueId= — список популярных позиций
 * POST   /api/admin/popular — добавить позицию
 */

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

async function guard() {
  const session = await auth();
  return session?.user?.role === "ADMIN";
}

export async function GET(request: Request): Promise<Response> {
  if (!(await guard())) return Response.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });

  const url = new URL(request.url);
  const venueId = url.searchParams.get("venueId");
  if (!venueId) return Response.json({ ok: false, error: "VENUE_ID_REQUIRED" }, { status: 400 });

  const items = await prisma.popularProduct.findMany({
    where: { venueId },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true, sortOrder: true,
      product: { select: { id: true, name: true, imageUrl: true, price: true } },
    },
  });
  return Response.json({ ok: true, items });
}

const postSchema = z.object({
  venueId: z.string().min(1),
  productId: z.string().min(1),
  sortOrder: z.coerce.number().int().min(0).optional(),
});

export async function POST(request: Request): Promise<Response> {
  if (!(await guard())) return Response.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });

  try {
    const body = await request.json();
    const parsed = postSchema.safeParse(body);
    if (!parsed.success) return Response.json({ ok: false, error: "VALIDATION_ERROR" }, { status: 400 });

    const item = await prisma.popularProduct.create({
      data: { venueId: parsed.data.venueId, productId: parsed.data.productId, sortOrder: parsed.data.sortOrder ?? 0 },
      select: { id: true },
    });
    return Response.json({ ok: true, item }, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("Unique")) return Response.json({ ok: false, error: "ALREADY_EXISTS" }, { status: 409 });
    console.error("[POST /api/admin/popular]", e);
    return Response.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
