"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { DeliveryForm } from "@/components/checkout/DeliveryForm";
import { PickupForm } from "@/components/checkout/PickupForm";
import { useCart } from "@/hooks/useCart";
import { useVenueStore } from "@/store/venueStore";
import { formatPriceFromKopecks, sumCartTotalKopecks } from "@/lib/utils";
import type { CheckoutFormData } from "@/lib/validations/checkout.schema";

/**
 * Клиентская страница оформления заказа.
 *
 * Показывает переключатель «Самовывоз / Доставка», соответствующую форму
 * и краткую сводку позиций корзины справа (или снизу на мобильном).
 * При успешном создании заказа перенаправляет на `/order/[id]`.
 * При пустой корзине — показывает заглушку с ссылкой в меню.
 *
 * @param defaultPhone - Телефон из профиля авторизованного пользователя (опционально)
 */
export function CheckoutPageClient({ defaultPhone }: { defaultPhone?: string }) {
  const router = useRouter();
  const { items, clear } = useCart();
  const selectedVenue = useVenueStore((s) => s.selectedVenue);

  const [orderType, setOrderType] = useState<"pickup" | "delivery">("delivery");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const totalKopecks = sumCartTotalKopecks(items);

  const handleSubmit = async (data: CheckoutFormData) => {
    if (!selectedVenue) {
      setServerError("Не выбрано заведение. Вернитесь на главную и выберите заведение.");
      return;
    }
    if (items.length === 0) return;

    setIsSubmitting(true);
    setServerError(null);

    try {
      const body = {
        venueId: selectedVenue.id,
        form: data,
        items: items.map((it) => ({
          productId: it.product.id,
          quantity: it.quantity,
          wishes: it.wishes || undefined,
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = (await res.json()) as { ok: boolean; orderId?: string; error?: string };

      if (!res.ok || !json.ok) {
        const messages: Record<string, string> = {
          CART_EMPTY: "Корзина пуста",
          VENUE_NOT_FOUND: "Заведение не найдено или временно закрыто",
          PRODUCT_UNAVAILABLE: "Один из товаров недоступен. Обновите корзину",
          VALIDATION_ERROR: "Проверьте правильность заполнения формы",
        };
        setServerError(messages[json.error ?? ""] ?? "Не удалось создать заказ. Попробуйте ещё раз");
        return;
      }

      clear();
      router.push(`/order/${json.orderId}`);
    } catch {
      setServerError("Ошибка сети. Проверьте подключение и попробуйте ещё раз");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-vanilla-300 bg-vanilla-100/60 px-6 py-16 text-center">
        <h1 className="font-serif text-2xl font-semibold text-vanilla-900">Корзина пуста</h1>
        <p className="mt-3 text-sm text-vanilla-600">
          Добавьте блюда из меню, чтобы оформить заказ.
        </p>
        <Link
          href="/menu"
          className="mt-8 inline-flex rounded-xl bg-vanilla-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-vanilla-400"
        >
          Перейти в меню
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-serif text-3xl font-semibold text-vanilla-900">Оформление заказа</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Левая колонка: тип доставки + форма */}
        <div className="space-y-6">
          {/* Переключатель типа заказа */}
          <div className="flex overflow-hidden rounded-2xl border border-vanilla-200 bg-vanilla-50">
            <button
              type="button"
              onClick={() => setOrderType("delivery")}
              className={`flex-1 py-3 text-sm font-semibold transition ${
                orderType === "delivery"
                  ? "bg-vanilla-500 text-white shadow-sm"
                  : "text-vanilla-600 hover:bg-vanilla-100"
              }`}
            >
              Доставка
            </button>
            <button
              type="button"
              onClick={() => setOrderType("pickup")}
              className={`flex-1 py-3 text-sm font-semibold transition ${
                orderType === "pickup"
                  ? "bg-vanilla-500 text-white shadow-sm"
                  : "text-vanilla-600 hover:bg-vanilla-100"
              }`}
            >
              Самовывоз
            </button>
          </div>

          {serverError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {serverError}
            </div>
          )}

          <div className="rounded-2xl border border-vanilla-200 bg-white p-6 shadow-sm">
            {orderType === "delivery" ? (
              <DeliveryForm
                totalKopecks={totalKopecks}
                defaultPhone={defaultPhone}
                onSubmit={(data) => handleSubmit(data)}
                isSubmitting={isSubmitting}
              />
            ) : (
              <PickupForm
                venueAddress={selectedVenue?.address}
                totalKopecks={totalKopecks}
                defaultPhone={defaultPhone}
                onSubmit={(data) => handleSubmit(data)}
                isSubmitting={isSubmitting}
              />
            )}
          </div>
        </div>

        {/* Правая колонка: сводка заказа */}
        <aside>
          <div className="sticky top-24 rounded-2xl border border-vanilla-200 bg-white p-5 shadow-sm">
            <h2 className="font-serif text-lg font-semibold text-vanilla-900">Ваш заказ</h2>

            <ul className="mt-4 space-y-3">
              {items.map((item) => (
                <li key={item.cartItemId} className="flex items-start gap-3">
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
                    <p className="truncate text-sm font-medium text-vanilla-900">{item.product.name}</p>
                    {item.wishes && (
                      <p className="mt-0.5 truncate text-xs text-vanilla-500">{item.wishes}</p>
                    )}
                    <p className="mt-0.5 text-xs text-vanilla-600">
                      {item.quantity} × {formatPriceFromKopecks(item.product.price)}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-vanilla-900">
                    {formatPriceFromKopecks(item.product.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-5 border-t border-vanilla-200 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-vanilla-700">Итого</span>
                <span className="font-serif text-xl font-bold text-vanilla-900">
                  {formatPriceFromKopecks(totalKopecks)}
                </span>
              </div>
            </div>

            <Link
              href="/cart"
              className="mt-4 block text-center text-xs text-vanilla-500 underline-offset-2 hover:underline"
            >
              Изменить корзину
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
