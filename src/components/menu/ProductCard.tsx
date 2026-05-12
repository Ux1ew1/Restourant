"use client";

import Image from "next/image";
import Link from "next/link";

import { formatPriceFromKopecks } from "@/lib/utils";
import type { MenuProduct } from "@/types/menu";

const PLACEHOLDER = "/images/placeholder/product-placeholder.svg";

/** Пропсы карточки товара в сетке меню */
export interface ProductCardProps {
  /** Данные товара из API */
  product: MenuProduct;
  /** Обработчик кнопки «В корзину» */
  onAddToCart: (product: MenuProduct) => void;
}

/**
 * Карточка товара в сетке меню.
 *
 * Показывает изображение с заглушкой, название, граммовку, цену, индикаторы стоп-листа и скрытия,
 * кнопку добавления в корзину (на этапе 6 увеличивает только бейдж в шапке).
 *
 * @param product - Объект товара
 * @param onAddToCart - Вызывается при нажатии «В корзину», если позиция не в стоп-листе
 *
 * @example
 * <ProductCard product={p} onAddToCart={handleAdd} />
 */
export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const disabled = product.isStopList;
  const showHiddenBadge = product.isHidden;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-vanilla-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <Link
        href={`/product/${product.id}`}
        className="relative block aspect-4/3 bg-vanilla-100"
        aria-label={`Открыть ${product.name}`}
      >
        <Image
          src={product.imageUrl || PLACEHOLDER}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="pointer-events-none absolute left-2 top-2 flex flex-wrap gap-1">
          {product.isStopList ? (
            <span className="rounded-md bg-vanilla-900/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-vanilla-50">
              Стоп-лист
            </span>
          ) : null}
          {showHiddenBadge ? (
            <span className="rounded-md bg-vanilla-500/95 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
              Скрыто
            </span>
          ) : null}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="min-h-0 flex-1">
          <Link href={`/product/${product.id}`} className="group">
            <h3 className="line-clamp-2 text-base font-semibold leading-snug text-vanilla-900 group-hover:text-vanilla-700">
              {product.name}
            </h3>
          </Link>
          {product.weight ? (
            <p className="mt-1 text-xs text-vanilla-500">{product.weight}</p>
          ) : null}
        </div>
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-vanilla-100 pt-3">
          <p className="text-sm font-semibold text-vanilla-800">
            {formatPriceFromKopecks(product.price)}
          </p>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onAddToCart(product)}
            className="rounded-xl bg-vanilla-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition enabled:hover:bg-vanilla-400 disabled:cursor-not-allowed disabled:bg-vanilla-300 disabled:text-vanilla-100"
          >
            В корзину
          </button>
        </div>
      </div>
    </article>
  );
}
