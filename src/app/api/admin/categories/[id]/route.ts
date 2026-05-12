/**
 * @module /api/admin/categories/[id]
 *
 * PATCH  /api/admin/categories/[id] — обновить категорию
 * DELETE /api/admin/categories/[id] — удалить категорию
 */

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

async function guard() {
  const session = await auth();
  return session?.user?.role === "ADMIN";
}

const patchSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  slug: z.string().trim().regex(/^[a-z0-9-]+$/).optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  if (!(await guard())) return Response.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ ok: false, error: "VALIDATION_ERROR" }, { status: 400 });
    }

    const category = await prisma.category.update({
      where: { id },
      data: parsed.data,
      select: { id: true, name: true, slug: true, sortOrder: true, isActive: true },
    });
    return Response.json({ ok: true, category });
  } catch (e) {
    console.error("[PATCH /api/admin/categories/[id]]", e);
    return Response.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  if (!(await guard())) return Response.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });

  try {
    const { id } = await params;
    await prisma.category.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("Restrict") || msg.includes("Foreign")) {
      return Response.json({ ok: false, error: "CATEGORY_HAS_PRODUCTS" }, { status: 409 });
    }
    console.error("[DELETE /api/admin/categories/[id]]", e);
    return Response.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
