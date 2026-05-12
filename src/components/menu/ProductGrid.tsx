"use client";

import type { MenuProduct } from "@/types/menu";

import { ProductCard } from "./ProductCard";

/** Пропсы сетки товаров */
export interface ProductGridProps {
  /** Список товаров для отображения */
  products: MenuProduct[];
  /** Колбэк увеличения количества */
  onAddToCart: (product: MenuProduct) => void;
  /** Колбэк уменьшения количества */
  onDecreaseFromCart: (product: MenuProduct) => void;
  /** Колбэк удаления позиции из корзины */
  onRemoveFromCart: (product: MenuProduct) => void;
  /** Возвращает текущее количество позиции в корзине */
  getQuantityInCart: (product: MenuProduct) => number;
}

/**
 * Адаптивная сетка карточек товаров меню.
 *
 * @param products - Товары одной выборки (фильтр по категории выполняется на странице/API)
 * @param onAddToCart - Проброс в `ProductCard` (увеличение)
 * @param onDecreaseFromCart - Проброс уменьшения количества
 * @param onRemoveFromCart - Проброс удаления строки
 * @param getQuantityInCart - Функция получения текущего количества в корзине
 *
 * @example
 * <ProductGrid products={items} onAddToCart={addOne} />
 */
export function ProductGrid({
  products,
  onAddToCart,
  onDecreaseFromCart,
  onRemoveFromCart,
  getQuantityInCart,
}: ProductGridProps) {
  if (!products.length) {
    return (
      <p className="rounded-[24px] border border-dashed border-[#c8a97e]/45 bg-white/55 px-4 py-12 text-center text-sm text-[#1a1a1a]/58">
        В этом разделе пока нет позиций
      </p>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((p) => (
        <ProductCard
          key={p.id}
          product={p}
          onAddToCart={onAddToCart}
          onDecreaseFromCart={onDecreaseFromCart}
          onRemoveFromCart={onRemoveFromCart}
          quantityInCart={getQuantityInCart(p)}
        />
      ))}
    </div>
  );
}
