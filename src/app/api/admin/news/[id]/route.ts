/**
 * @module /api/admin/news/[id]
 *
 * PATCH  — обновить баннер
 * DELETE — удалить баннер
 */

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { imageUrlSchema } from "@/lib/validations/image-url";
import { z } from "zod";

async function guard() {
  const session = await auth();
  return session?.user?.role === "ADMIN";
}

const patchSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  imageUrl: imageUrlSchema("Некорректный URL").optional().or(z.literal("")),
  content: z.string().trim().max(2000).optional(),
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
    if (!parsed.success) return Response.json({ ok: false, error: "VALIDATION_ERROR" }, { status: 400 });

    const item = await prisma.newsItem.update({
      where: { id },
      data: {
        ...(parsed.data.title !== undefined ? { title: parsed.data.title } : {}),
        ...(parsed.data.imageUrl !== undefined ? { imageUrl: parsed.data.imageUrl || null } : {}),
        ...(parsed.data.content !== undefined ? { content: parsed.data.content || null } : {}),
        ...(parsed.data.isActive !== undefined ? { isActive: parsed.data.isActive } : {}),
      },
      select: { id: true, title: true, isActive: true },
    });
    return Response.json({ ok: true, item });
  } catch (e) {
    console.error("[PATCH /api/admin/news/[id]]", e);
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
    await prisma.newsItem.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (e) {
    console.error("[DELETE /api/admin/news/[id]]", e);
    return Response.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
