"use client";

import { useEffect, useState } from "react";

import { StatsChart } from "@/components/admin/StatsChart";
import { formatPriceFromKopecks } from "@/lib/utils";

type Period = "day" | "week" | "month";

interface StatsData {
  period: string;
  from: string;
  totalOrders: number;
  totalRevenue: number;
  byStatus: { status: string; count: number }[];
  topProducts: { product: { id: string; name: string } | undefined; quantity: number }[];
  revenueByVenue: { venueId: string; venueName: string; revenue: number; orders: number }[];
}

const STATUS_LABELS: Record<string, string> = {
  new: "Новые", accepted: "Принятые", in_progress: "Готовятся",
  delivering: "В пути", done: "Выполненные", cancelled: "Отменённые",
};

const PERIOD_LABELS: Record<Period, string> = { day: "24 часа", week: "7 дней", month: "30 дней" };

/**
 * Страница статистики: метрики за период, топ-10 блюд, выручка по заведениям.
 */
export function AdminStatsClient() {
  const [period, setPeriod] = useState<Period>("week");
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/admin/stats?period=${period}`)
      .then((r) => r.json())
      .then((json: { ok: boolean; stats: StatsData }) => {
        if (json.ok) setStats(json.stats);
        setIsLoading(false);
      });
  }, [period]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-2xl font-bold text-vanilla-900">Статистика</h1>

        {/* Переключатель периода */}
        <div className="flex overflow-hidden rounded-xl border border-vanilla-200">
          {(["day", "week", "month"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 text-sm font-medium transition ${period === p ? "bg-vanilla-500 text-white" : "bg-vanilla-50 text-vanilla-600 hover:bg-vanilla-100"}`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((k) => (
            <div key={k} className="h-24 animate-pulse rounded-2xl bg-vanilla-200" />
          ))}
        </div>
      )}

      {stats && !isLoading && (
        <>
          {/* Ключевые метрики */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Заказов" value={stats.totalOrders.toLocaleString("ru-RU")} />
            <MetricCard label="Выручка" value={formatPriceFromKopecks(stats.totalRevenue)} />
            <MetricCard
              label="Средний чек"
              value={stats.totalOrders > 0
                ? formatPriceFromKopecks(Math.round(stats.totalRevenue / stats.totalOrders))
                : "—"}
            />
            <MetricCard
              label="Отменено"
              value={(stats.byStatus.find((s) => s.status === "cancelled")?.count ?? 0).toString()}
              accent="text-red-600"
            />
          </div>

          {/* Статусы */}
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <StatsChart
              title="Заказы по статусам"
              items={stats.byStatus.map((s) => ({
                label: STATUS_LABELS[s.status] ?? s.status,
                value: s.count,
              }))}
              unit=" шт."
            />

            <StatsChart
              title="Топ-10 блюд"
              items={stats.topProducts
                .filter((r) => r.product)
                .map((r) => ({ label: r.product!.name, value: r.quantity }))}
              unit=" шт."
            />
          </div>

          {/* Выручка по заведениям */}
          {stats.revenueByVenue.length > 0 && (
            <div className="mt-6">
              <StatsChart
                title="Выручка по заведениям"
                items={stats.revenueByVenue.map((r) => ({
                  label: r.venueName,
                  value: Math.round(r.revenue / 100),
                }))}
                unit=" ₽"
              />
            </div>
          )}

          <p className="mt-4 text-xs text-vanilla-400">
            Период: с {new Date(stats.from).toLocaleDateString("ru-RU")} по сегодня
          </p>
        </>
      )}
    </div>
  );
}

/** Карточка ключевой метрики */
function MetricCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-2xl border border-vanilla-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-vanilla-500">{label}</p>
      <p className={`mt-2 font-serif text-2xl font-bold ${accent ?? "text-vanilla-900"}`}>{value}</p>
    </div>
  );
}
