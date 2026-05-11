"use client";

import Link from "next/link";

import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { useCart } from "@/hooks/useCart";
import { sumCartTotalKopecks } from "@/lib/utils";

/**
 * Клиентская страница корзины: список позиций, правка количества, итог и ссылка на оформление.
 */
export function CartPageClient() {
  const { items, removeItem, updateQuantity, updateWishes } = useCart();
  const totalKopecks = sumCartTotalKopecks(items);

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-vanilla-300 bg-vanilla-100/60 px-6 py-16 text-center">
        <h1 className="font-serif text-2xl font-semibold text-vanilla-900">Корзина пуста</h1>
        <p className="mt-3 text-sm text-vanilla-600">
          Добавьте блюда из меню — они появятся здесь с выбранным количеством и пожеланиями.
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
    <div>
      <h1 className="font-serif text-3xl font-semibold text-vanilla-900">Корзина</h1>
      <p className="mt-1 text-sm text-vanilla-600">
        Позиций: {items.length} · Всего единиц: {items.reduce((s, it) => s + it.quantity, 0)}
      </p>

      <ul className="mt-8 space-y-4" aria-label="Позиции в корзине">
        {items.map((item) => (
          <li key={item.cartItemId}>
            <CartItem
              item={item}
              onIncrement={() => updateQuantity(item.cartItemId, item.quantity + 1)}
              onDecrement={() => {
                if (item.quantity > 1) updateQuantity(item.cartItemId, item.quantity - 1);
              }}
              onRemove={() => removeItem(item.cartItemId)}
              onUpdateWishes={(wishes) => updateWishes(item.cartItemId, wishes)}
            />
          </li>
        ))}
      </ul>

      <CartSummary totalKopecks={totalKopecks} hasItems />
    </div>
  );
}
