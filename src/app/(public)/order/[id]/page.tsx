import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { formatPriceFromKopecks } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Заказ оформлен",
  description: "Детали вашего заказа",
};

/** Тип строки заказа для отображения */
interface OrderItemRow {
  id: string;
  quantity: number;
  price: number;
  wishes: string | null;
  product: {
    id: string;
    name: string;
    imageUrl: string | null;
    weight: string | null;
  };
}

/** Детальная модель заказа, возвращаемая из БД */
interface OrderDetail {
  id: string;
  type: string;
  status: string;
  totalPrice: number;
  address: string | null;
  phone: string;
  paymentMethod: string;
  changeFrom: number | null;
  deliveryTime: Date | null;
  comment: string | null;
  createdAt: Date;
  venue: { id: string; name: string; address: string; phone: string | null };
  items: OrderItemRow[];
}

const STATUS_LABELS: Record<string, string> = {
  new: "Новый — ожидает подтверждения",
  accepted: "Принят",
  in_progress: "Готовится",
  delivering: "В пути",
  done: "Выполнен",
  cancelled: "Отменён",
};

const PAYMENT_LABELS: Record<string, string> = {
  card: "Картой",
  cash: "Наличными",
};

/**
 * Страница подтверждения и статуса заказа.
 *
 * Серверный компонент — данные заказа загружаются напрямую через Prisma.
 * Доступна без авторизации: клиент получает URL сразу после оформления.
 *
 * @param params - Параметры маршрута: `id` — идентификатор заказа
 */
export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = (await prisma.order.findUnique({
    where: { id },
    select: {
      id: true,
      type: true,
      status: true,
      totalPrice: true,
      address: true,
      phone: true,
      paymentMethod: true,
      changeFrom: true,
      deliveryTime: true,
      comment: true,
      createdAt: true,
      venue: { select: { id: true, name: true, address: true, phone: true } },
      items: {
        select: {
          id: true,
          quantity: true,
          price: true,
          wishes: true,
          product: { select: { id: true, name: true, imageUrl: true, weight: true } },
        },
      },
    },
  })) as OrderDetail | null;

  if (!order) notFound();

  const isCancelled = order.status === "cancelled";

  return (
    <div className="mx-auto max-w-2xl">
      {/* Статус-хедер */}
      <div
        className={`rounded-2xl px-6 py-8 text-center ${
          isCancelled
            ? "border border-red-200 bg-red-50"
            : "border border-green-200 bg-green-50"
        }`}
      >
        <div
          className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${
            isCancelled ? "bg-red-100" : "bg-green-100"
          }`}
        >
          {isCancelled ? (
            <svg className="h-7 w-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-7 w-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <h1 className="font-serif text-2xl font-bold text-vanilla-900">
          {isCancelled ? "Заказ отменён" : "Заказ оформлен!"}
        </h1>
        <p className="mt-2 text-sm text-vanilla-600">
          {isCancelled
            ? "Свяжитесь с заведением, если у вас есть вопросы."
            : "Мы уже получили ваш заказ и скоро приступим к его приготовлению."}
        </p>
        <p className="mt-3 text-xs font-mono text-vanilla-500">#{order.id}</p>
      </div>

      {/* Статус */}
      <div className="mt-6 rounded-2xl border border-vanilla-200 bg-white p-5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-vanilla-500">
          Статус заказа
        </h2>
        <p className="mt-2 text-sm font-semibold text-vanilla-900">
          {STATUS_LABELS[order.status] ?? order.status}
        </p>
      </div>

      {/* Детали доставки */}
      <div className="mt-4 rounded-2xl border border-vanilla-200 bg-white p-5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-vanilla-500">
          {order.type === "delivery" ? "Доставка" : "Самовывоз"}
        </h2>
        <dl className="mt-3 space-y-2 text-sm">
          {order.type === "delivery" && order.address && (
            <div className="flex justify-between gap-4">
              <dt className="text-vanilla-600">Адрес</dt>
              <dd className="text-right font-medium text-vanilla-900">{order.address}</dd>
            </div>
          )}
          {order.type === "pickup" && (
            <div className="flex justify-between gap-4">
              <dt className="text-vanilla-600">Адрес самовывоза</dt>
              <dd className="text-right font-medium text-vanilla-900">{order.venue.address}</dd>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <dt className="text-vanilla-600">Телефон</dt>
            <dd className="font-medium text-vanilla-900">{order.phone}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-vanilla-600">Оплата</dt>
            <dd className="font-medium text-vanilla-900">
              {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
              {order.paymentMethod === "cash" && order.changeFrom
                ? ` (сдача с ${order.changeFrom} ₽)`
                : ""}
            </dd>
          </div>
          {order.deliveryTime && (
            <div className="flex justify-between gap-4">
              <dt className="text-vanilla-600">Желаемое время</dt>
              <dd className="font-medium text-vanilla-900">
                {new Date(order.deliveryTime).toLocaleString("ru-RU", {
                  day: "2-digit",
                  month: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </dd>
            </div>
          )}
          {order.comment && (
            <div className="flex justify-between gap-4">
              <dt className="text-vanilla-600">Комментарий</dt>
              <dd className="text-right font-medium text-vanilla-900">{order.comment}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Состав заказа */}
      <div className="mt-4 rounded-2xl border border-vanilla-200 bg-white p-5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-vanilla-500">
          Состав заказа
        </h2>
        <ul className="mt-4 space-y-3">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-start gap-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-vanilla-100">
                {item.product.imageUrl ? (
                  <Image
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-vanilla-400">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 21h18M3.75 3h16.5A.75.75 0 0121 3.75v12.75" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-vanilla-900">{item.product.name}</p>
                {item.product.weight && (
                  <p className="text-xs text-vanilla-500">{item.product.weight}</p>
                )}
                {item.wishes && (
                  <p className="mt-0.5 text-xs text-vanilla-500 italic">{item.wishes}</p>
                )}
                <p className="mt-0.5 text-xs text-vanilla-600">
                  {item.quantity} × {formatPriceFromKopecks(item.price)}
                </p>
              </div>
              <span className="shrink-0 text-sm font-semibold text-vanilla-900">
                {formatPriceFromKopecks(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-5 border-t border-vanilla-200 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-vanilla-700">Итого</span>
            <span className="font-serif text-xl font-bold text-vanilla-900">
              {formatPriceFromKopecks(order.totalPrice)}
            </span>
          </div>
        </div>
      </div>

      {/* Заведение */}
      <div className="mt-4 rounded-2xl border border-vanilla-200 bg-white p-5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-vanilla-500">
          Заведение
        </h2>
        <p className="mt-2 text-sm font-semibold text-vanilla-900">{order.venue.name}</p>
        <p className="text-sm text-vanilla-600">{order.venue.address}</p>
        {order.venue.phone && (
          <a
            href={`tel:${order.venue.phone}`}
            className="mt-1 block text-sm text-vanilla-500 hover:text-vanilla-700"
          >
            {order.venue.phone}
          </a>
        )}
      </div>

      {/* Навигация */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/menu"
          className="flex-1 rounded-xl bg-vanilla-500 py-3 text-center text-sm font-semibold text-white transition hover:bg-vanilla-400"
        >
          Продолжить покупки
        </Link>
        <Link
          href="/"
          className="flex-1 rounded-xl border border-vanilla-200 py-3 text-center text-sm font-semibold text-vanilla-700 transition hover:bg-vanilla-100"
        >
          На главную
        </Link>
      </div>
    </div>
  );
}
