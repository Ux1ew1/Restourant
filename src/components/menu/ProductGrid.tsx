"use client";

import type { MenuProduct } from "@/types/menu";

import { ProductCard } from "./ProductCard";

/** Пропсы сетки товаров */
export interface ProductGridProps {
  /** Список товаров для отображения */
  products: MenuProduct[];
  /** Колбэк добавления в корзину */
  onAddToCart: (product: MenuProduct) => void;
}

/**
 * Адаптивная сетка карточек товаров меню.
 *
 * @param products - Товары одной выборки (фильтр по категории выполняется на странице/API)
 * @param onAddToCart - Проброс в `ProductCard`
 *
 * @example
 * <ProductGrid products={items} onAddToCart={addOne} />
 */
export function ProductGrid({ products, onAddToCart }: ProductGridProps) {
  if (!products.length) {
    return (
      <p className="rounded-2xl border border-dashed border-vanilla-300 bg-vanilla-100/60 px-4 py-10 text-center text-sm text-vanilla-600">
        В этом разделе пока нет позиций
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} />
      ))}
    </div>
  );
}
