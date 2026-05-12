/**
 * @module /api/admin/popular/[id]
 *
 * PATCH  — обновить sortOrder
 * DELETE — убрать из популярного
 */

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function guard() {
  const session = await auth();
  return session?.user?.role === "ADMIN";
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  if (!(await guard())) return Response.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });

  const { id } = await params;
  const { sortOrder } = (await request.json()) as { sortOrder?: number };
  const item = await prisma.popularProduct.update({
    where: { id },
    data: { sortOrder: sortOrder ?? 0 },
    select: { id: true, sortOrder: true },
  });
  return Response.json({ ok: true, item });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  if (!(await guard())) return Response.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });

  const { id } = await params;
  await prisma.popularProduct.delete({ where: { id } });
  return Response.json({ ok: true });
}
