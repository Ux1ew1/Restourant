"use client";

import Link from "next/link";

import { formatPriceFromKopecks } from "@/lib/utils";

/** Пропсы итогового блока корзины */
export interface CartSummaryProps {
  /** Сумма заказа в копейках */
  totalKopecks: number;
  /** Есть ли позиции (для активации кнопки оформления) */
  hasItems: boolean;
}

/**
 * Итог корзины: сумма и переход к оформлению заказа.
 *
 * @param totalKopecks - Сумма всех строк
 * @param hasItems - Показывать активную ссылку «Оформить заказ»
 *
 * @example
 * <CartSummary totalKopecks={sum} hasItems={items.length > 0} />
 */
export function CartSummary({ totalKopecks, hasItems }: CartSummaryProps) {
  return (
    <div className="mt-8 border-t border-vanilla-300 pt-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-vanilla-600">Сумма заказа</p>
          <p className="mt-1 font-serif text-2xl font-semibold text-vanilla-900">
            {formatPriceFromKopecks(totalKopecks)}
          </p>
        </div>
        {hasItems ? (
          <Link
            href="/checkout"
            className="inline-flex items-center justify-center rounded-xl bg-vanilla-500 px-6 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-vanilla-400"
          >
            Оформить заказ
          </Link>
        ) : (
          <span className="inline-flex cursor-not-allowed items-center justify-center rounded-xl bg-vanilla-200 px-6 py-3 text-sm font-semibold text-vanilla-500">
            Оформить заказ
          </span>
        )}
      </div>
    </div>
  );
}
