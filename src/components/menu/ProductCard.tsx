"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

import { formatPriceFromKopecks } from "@/lib/utils";
import type { MenuProduct } from "@/types/menu";

const PLACEHOLDER = "/images/placeholder/product-placeholder.svg";

/** Пропсы карточки товара в сетке меню */
export interface ProductCardProps {
  /** Данные товара из API */
  product: MenuProduct;
  /** Обработчик добавления / увеличения количества */
  onAddToCart: (product: MenuProduct) => void;
  /** Обработчик уменьшения количества */
  onDecreaseFromCart: (product: MenuProduct) => void;
  /** Обработчик полного удаления позиции */
  onRemoveFromCart: (product: MenuProduct) => void;
  /** Текущее количество позиции в корзине */
  quantityInCart: number;
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
export function ProductCard({
  product,
  onAddToCart,
  onDecreaseFromCart,
  onRemoveFromCart,
  quantityInCart,
}: ProductCardProps) {
  const disabled = product.isStopList;
  const showHiddenBadge = product.isHidden;

  function handleAddClick() {
    if (disabled) return;
    onAddToCart(product);
  }

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[24px] border border-[#c8a97e]/20 bg-white shadow-[0_14px_34px_rgba(26,26,26,0.08)] transition-all hover:-translate-y-1 hover:shadow-[0_24px_52px_rgba(26,26,26,0.14)]">
      <Link
        href={`/product/${product.id}`}
        className="relative block aspect-[1.18] bg-vanilla-100"
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

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="min-h-0 flex-1">
          <Link href={`/product/${product.id}`} className="group">
            <h3 className="line-clamp-2 text-base font-semibold leading-snug text-[#1a1a1a] group-hover:text-[#5a2e2e]">
              {product.name}
            </h3>
          </Link>
          {product.weight ? (
            <p className="mt-1 text-sm leading-6 text-[#1a1a1a]/58">{product.weight}</p>
          ) : null}
        </div>
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-[#c8a97e]/20 pt-3">
          <p className="text-lg font-semibold text-[#1a1a1a]">
            {formatPriceFromKopecks(product.price)}
          </p>
          <div className="flex h-10 w-32 shrink-0 justify-end">
            {quantityInCart > 0 ? (
              <div className="inline-flex h-10 items-center rounded-xl border border-[#c8a97e]/35 bg-[#f6f1ea] p-1">
                <button
                  type="button"
                  onClick={() =>
                    quantityInCart <= 1
                      ? onRemoveFromCart(product)
                      : onDecreaseFromCart(product)
                  }
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-[#5a2e2e] transition hover:bg-[#c8a97e]/25"
                  aria-label={
                    quantityInCart <= 1 ? "Удалить из корзины" : "Уменьшить количество"
                  }
                >
                  {quantityInCart <= 1 ? (
                    <span className="text-xl leading-none" aria-hidden>
                      ×
                    </span>
                  ) : (
                    <span className="text-lg leading-none">−</span>
                  )}
                </button>
                <motion.span
                  key={quantityInCart}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                  className="min-w-8 px-1 text-center text-sm font-semibold tabular-nums text-[#1a1a1a]"
                >
                  {quantityInCart}
                </motion.span>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={handleAddClick}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-lg text-[#2f3a2f] transition enabled:hover:bg-[#c8a97e]/25 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Увеличить количество"
                >
                  +
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={disabled}
                onClick={handleAddClick}
                className="h-10 cursor-pointer rounded-xl bg-[#c8a97e] px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#1a1a1a] shadow-sm transition enabled:hover:bg-[#e0bf8d] disabled:cursor-not-allowed disabled:bg-vanilla-300 disabled:text-vanilla-100"
              >
                В корзину
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
