/**
 * @module /api/admin/stats
 *
 * GET /api/admin/stats?venueId=&period=day|week|month — агрегированная статистика.
 */

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Возвращает статистику: количество и сумму заказов за период, топ-10 товаров, разбивку по статусам.
 *
 * @param request - Next.js Request; query-param `period` = day | week | month (default: week)
 * @returns JSON `{ ok, stats }`
 */
export async function GET(request: Request): Promise<Response> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return Response.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });
  }

  try {
    const url = new URL(request.url);
    const venueId = url.searchParams.get("venueId") || undefined;
    const period = url.searchParams.get("period") ?? "week";

    const now = new Date();
    const from = new Date(now);
    if (period === "day") from.setDate(from.getDate() - 1);
    else if (period === "month") from.setMonth(from.getMonth() - 1);
    else from.setDate(from.getDate() - 7);

    const baseWhere = {
      createdAt: { gte: from },
      ...(venueId ? { venueId } : {}),
    };

    const [
      totalOrders,
      revenueAgg,
      byStatus,
      topItems,
      revenueByVenue,
    ] = await Promise.all([
      prisma.order.count({ where: baseWhere }),

      prisma.order.aggregate({
        where: { ...baseWhere, status: { not: "cancelled" } },
        _sum: { totalPrice: true },
      }),

      prisma.order.groupBy({
        by: ["status"],
        where: baseWhere,
        _count: { _all: true },
      }),

      prisma.orderItem.groupBy({
        by: ["productId"],
        where: { order: baseWhere },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 10,
      }),

      prisma.order.groupBy({
        by: ["venueId"],
        where: baseWhere,
        _sum: { totalPrice: true },
        _count: { _all: true },
      }),
    ]);

    const productIds = topItems.map((r) => r.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, price: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    const venueIds = revenueByVenue.map((r) => r.venueId);
    const venues = await prisma.venue.findMany({
      where: { id: { in: venueIds } },
      select: { id: true, name: true },
    });
    const venueMap = new Map(venues.map((v) => [v.id, v.name]));

    return Response.json({
      ok: true,
      stats: {
        period,
        from: from.toISOString(),
        totalOrders,
        totalRevenue: revenueAgg._sum.totalPrice ?? 0,
        byStatus: byStatus.map((r) => ({ status: r.status, count: r._count._all })),
        topProducts: topItems.map((r) => ({
          product: productMap.get(r.productId),
          quantity: r._sum.quantity ?? 0,
        })),
        revenueByVenue: revenueByVenue.map((r) => ({
          venueId: r.venueId,
          venueName: venueMap.get(r.venueId) ?? r.venueId,
          revenue: r._sum.totalPrice ?? 0,
          orders: r._count._all,
        })),
      },
    });
  } catch (e) {
    console.error("[GET /api/admin/stats]", e);
    return Response.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
