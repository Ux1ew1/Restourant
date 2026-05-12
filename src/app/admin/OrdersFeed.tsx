"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { OrderCard, ORDER_STATUSES } from "@/components/admin/OrderCard";

interface OrderData {
  id: string;
  type: string;
  status: string;
  totalPrice: number;
  address: string | null;
  phone: string;
  paymentMethod: string;
  changeFrom: number | null;
  deliveryTime: string | null;
  comment: string | null;
  createdAt: string;
  venue: { id: string; name: string };
  user: { id: string; name: string | null; email: string; phone: string | null } | null;
  items: {
    id: string;
    quantity: number;
    price: number;
    wishes: string | null;
    product: { id: string; name: string; weight: string | null };
  }[];
}

/**
 * Лента заказов с фильтрацией по статусу и постраничной загрузкой.
 *
 * Автоматически обновляется каждые 30 секунд при фокусе вкладки.
 */
export function AdminOrdersFeed() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const requestIdRef = useRef(0);

  const PAGE_SIZE = 20;

  const fetchOrders = useCallback(async (p: number, status: string) => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p) });
      if (status !== "all") params.set("status", status);
      const res = await fetch(`/api/admin/orders?${params}`);
      const json = await res.json() as { ok: boolean; orders: OrderData[]; total: number };
      // Игнорируем устаревшие ответы, чтобы список не «прыгал» при быстрых переключениях статусов.
      if (json.ok && requestId === requestIdRef.current) {
        setOrders(json.orders);
        setTotal(json.total);
        setHasLoadedOnce(true);
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchOrders(page, statusFilter);
  }, [fetchOrders, page, statusFilter]);

  // Автообновление каждые 30 секунд
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchOrders(page, statusFilter);
      }
    }, 30_000);
    return () => clearInterval(id);
  }, [fetchOrders, page, statusFilter]);

  function handleStatusChange(orderId: string, newStatus: string) {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
    );
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-vanilla-900">Заказы</h1>
          <p className="mt-0.5 text-sm text-vanilla-600">Всего: {total}</p>
        </div>
        <button
          type="button"
          onClick={() => fetchOrders(page, statusFilter)}
          disabled={isLoading}
          aria-busy={isLoading}
          className="flex cursor-pointer items-center gap-2 rounded-xl border border-vanilla-200 px-4 py-2 text-sm font-medium text-vanilla-700 transition hover:bg-vanilla-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Обновить
        </button>
      </div>

      {/* Фильтр по статусу */}
      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => { setStatusFilter("all"); setPage(1); }}
          className={`cursor-pointer rounded-xl border px-3.5 py-1.5 text-xs font-semibold transition ${statusFilter === "all" ? "border-vanilla-500 bg-vanilla-500 text-white" : "border-vanilla-200 text-vanilla-600 hover:bg-vanilla-100"}`}
        >
          Все
        </button>
        {ORDER_STATUSES.map((s) => (
          <button
            type="button"
            key={s.value}
            onClick={() => { setStatusFilter(s.value); setPage(1); }}
            className={`cursor-pointer rounded-xl border px-3.5 py-1.5 text-xs font-semibold transition ${statusFilter === s.value ? "border-vanilla-500 bg-vanilla-500 text-white" : "border-vanilla-200 text-vanilla-600 hover:bg-vanilla-100"}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Список */}
      <div className="mt-6 space-y-4">
        {!hasLoadedOnce && isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((k) => (
              <div key={k} className="h-48 animate-pulse rounded-2xl bg-vanilla-200" />
            ))}
          </div>
        )}
        {hasLoadedOnce && !isLoading && orders.length === 0 && (
          <div className="rounded-2xl border border-dashed border-vanilla-300 py-16 text-center text-vanilla-500">
            Заказов не найдено
          </div>
        )}
        {hasLoadedOnce && isLoading ? (
          <p className="text-xs text-vanilla-500">Обновляем список...</p>
        ) : null}
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} onStatusChange={handleStatusChange} />
        ))}
      </div>

      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="cursor-pointer rounded-xl border border-vanilla-200 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Назад
          </button>
          <span className="text-sm text-vanilla-600">{page} / {totalPages}</span>
          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="cursor-pointer rounded-xl border border-vanilla-200 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
          >
            Вперёд →
          </button>
        </div>
      )}
    </div>
  );
}
