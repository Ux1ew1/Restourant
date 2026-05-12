/**
 * @module /api/admin/users
 *
 * GET   /api/admin/users — список пользователей
 * PATCH /api/admin/users/[id] — изменить роль пользователя
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
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
  const PAGE_SIZE = 30;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
    }),
    prisma.user.count(),
  ]);

  return Response.json({ ok: true, users, total, page, pageSize: PAGE_SIZE });
}

const patchRoleSchema = z.object({
  role: z.enum(["GUEST", "USER", "ADMIN"]),
});

export async function PATCH(request: Request): Promise<Response> {
  if (!(await guard())) return Response.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) return Response.json({ ok: false, error: "USER_ID_REQUIRED" }, { status: 400 });

    const body = await request.json();
    const parsed = patchRoleSchema.safeParse(body);
    if (!parsed.success) return Response.json({ ok: false, error: "VALIDATION_ERROR" }, { status: 400 });

    const user = await prisma.user.update({
      where: { id },
      data: { role: parsed.data.role },
      select: { id: true, role: true },
    });
    return Response.json({ ok: true, user });
  } catch (e) {
    console.error("[PATCH /api/admin/users]", e);
    return Response.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
