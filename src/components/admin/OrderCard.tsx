"use client";

import { useState } from "react";

import { formatPriceFromKopecks } from "@/lib/utils";

/** Статусы заказа с человекочитаемыми метками и цветами */
export const ORDER_STATUSES = [
  { value: "new", label: "Новый", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  { value: "accepted", label: "Принят", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "in_progress", label: "Готовится", color: "bg-orange-100 text-orange-800 border-orange-200" },
  { value: "delivering", label: "В пути", color: "bg-purple-100 text-purple-800 border-purple-200" },
  { value: "done", label: "Выполнен", color: "bg-green-100 text-green-800 border-green-200" },
  { value: "cancelled", label: "Отменён", color: "bg-red-100 text-red-800 border-red-200" },
] as const;

type OrderStatusValue = (typeof ORDER_STATUSES)[number]["value"];

interface OrderItemRow {
  id: string;
  quantity: number;
  price: number;
  wishes: string | null;
  product: { id: string; name: string; weight: string | null };
}

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
  items: OrderItemRow[];
}

/** Пропсы компонента OrderCard */
interface OrderCardProps {
  /** Данные заказа */
  order: OrderData;
  /** Вызывается после успешного обновления статуса */
  onStatusChange: (orderId: string, newStatus: string) => void;
}

const PAYMENT_LABELS: Record<string, string> = { card: "Карта", cash: "Наличные" };

/**
 * Карточка заказа в ленте администратора.
 *
 * Отображает полную информацию о заказе: состав, адрес, контакт, оплату.
 * Позволяет менять статус заказа через выпадающий список без перезагрузки страницы.
 *
 * @param order - Данные заказа
 * @param onStatusChange - Колбэк после смены статуса
 */
export function OrderCard({ order, onStatusChange }: OrderCardProps) {
  const [isChanging, setIsChanging] = useState(false);
  const [localStatus, setLocalStatus] = useState(order.status);

  const statusMeta =
    ORDER_STATUSES.find((s) => s.value === localStatus) ?? ORDER_STATUSES[0];

  async function handleStatusChange(newStatus: OrderStatusValue) {
    setIsChanging(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setLocalStatus(newStatus);
        onStatusChange(order.id, newStatus);
      }
    } finally {
      setIsChanging(false);
    }
  }

  return (
    <div className="rounded-2xl border border-vanilla-200 bg-white shadow-sm">
      {/* Шапка карточки */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-vanilla-100 px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-vanilla-500">#{order.id.slice(0, 8)}</span>
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusMeta.color}`}
            >
              {statusMeta.label}
            </span>
            <span className="rounded-full border border-vanilla-200 bg-vanilla-50 px-2.5 py-0.5 text-xs text-vanilla-600">
              {order.type === "delivery" ? "Доставка" : "Самовывоз"}
            </span>
          </div>
          <p className="mt-1 text-xs text-vanilla-500">
            {new Date(order.createdAt).toLocaleString("ru-RU")} · {order.venue.name}
          </p>
        </div>

        {/* Смена статуса */}
        <div className="flex items-center gap-2">
          <select
            value={localStatus}
            disabled={isChanging}
            onChange={(e) => handleStatusChange(e.target.value as OrderStatusValue)}
            className="rounded-xl border border-vanilla-200 bg-vanilla-50 px-3 py-1.5 text-xs font-medium text-vanilla-800 focus:outline-none focus:ring-2 focus:ring-vanilla-500/20 disabled:opacity-60"
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 p-5 md:grid-cols-2">
        {/* Состав заказа */}
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-vanilla-500">
            Состав
          </h3>
          <ul className="space-y-1.5">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-2 text-sm">
                <span className="text-vanilla-800">
                  {item.product.name}
                  {item.product.weight && (
                    <span className="ml-1 text-xs text-vanilla-500">{item.product.weight}</span>
                  )}
                  {item.wishes && (
                    <span className="ml-1 text-xs italic text-vanilla-500">({item.wishes})</span>
                  )}
                  {" × "}
                  <span className="font-medium">{item.quantity}</span>
                </span>
                <span className="shrink-0 font-medium text-vanilla-900">
                  {formatPriceFromKopecks(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between border-t border-vanilla-100 pt-2 text-sm font-bold text-vanilla-900">
            <span>Итого</span>
            <span>{formatPriceFromKopecks(order.totalPrice)}</span>
          </div>
        </div>

        {/* Детали */}
        <div className="space-y-3">
          {order.address && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-vanilla-500">Адрес</p>
              <p className="mt-0.5 text-sm text-vanilla-900">{order.address}</p>
            </div>
          )}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-vanilla-500">Телефон</p>
            <a href={`tel:${order.phone}`} className="mt-0.5 block text-sm font-medium text-vanilla-900 hover:text-vanilla-600">
              {order.phone}
            </a>
          </div>
          {order.user && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-vanilla-500">Клиент</p>
              <p className="mt-0.5 text-sm text-vanilla-900">
                {order.user.name ?? order.user.email}
              </p>
            </div>
          )}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-vanilla-500">Оплата</p>
            <p className="mt-0.5 text-sm text-vanilla-900">
              {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
              {order.paymentMethod === "cash" && order.changeFrom
                ? ` (сдача с ${order.changeFrom} ₽)`
                : ""}
            </p>
          </div>
          {order.deliveryTime && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-vanilla-500">Время</p>
              <p className="mt-0.5 text-sm text-vanilla-900">
                {new Date(order.deliveryTime).toLocaleString("ru-RU", {
                  day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
                })}
              </p>
            </div>
          )}
          {order.comment && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-vanilla-500">Комментарий</p>
              <p className="mt-0.5 text-sm text-vanilla-700 italic">{order.comment}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
