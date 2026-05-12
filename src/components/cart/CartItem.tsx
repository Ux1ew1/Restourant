"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { formatPriceFromKopecks } from "@/lib/utils";
import type { CartItem as CartLineModel } from "@/types/cart";

const PLACEHOLDER = "/images/placeholder/product-placeholder.svg";
const WISHES_MAX = 500;

/** Иконка корзины (удалить позицию) */
function CartRemoveIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="22"
      height="22"
      aria-hidden
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

/** Иконка карандаша (изменить пожелание) */
function PencilIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="22"
      height="22"
      aria-hidden
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

/** Пропсы строки корзины */
export interface CartItemProps {
  /** Строка корзины */
  item: CartLineModel;
  /** Увеличить количество на 1 (максимум `maxQuantity`) */
  onIncrement: () => void;
  /** Уменьшить на 1 (не вызывается при количестве 1 — кнопка отключена) */
  onDecrement: () => void;
  /** Удалить строку целиком */
  onRemove: () => void;
  /** Сохранить новый текст пожелания (trim на стороне стора) */
  onUpdateWishes: (wishes: string) => void;
  /** Верхняя граница количества (по умолчанию 99) */
  maxQuantity?: number;
}

/**
 * Строка корзины: крупнее фото слева; справа в одном ряду с названием — правка пожелания и удаление;
 * граммовка сразу под названием, пожелание — под граммовкой; в нижнем ряду — счётчик и сумма на одной линии.
 *
 * @param item - Данные строки
 * @param onIncrement - Обработчик «+»
 * @param onDecrement - Обработчик «−» (только при quantity &gt; 1)
 * @param onRemove - Удаление строки
 * @param onUpdateWishes - Сохранение пожелания из формы редактирования
 * @param maxQuantity - Ограничение для «+»
 *
 * @example
 * <CartItem item={line} onIncrement={inc} onDecrement={dec} onRemove={rm} onUpdateWishes={setW} />
 */
export function CartItem({
  item,
  onIncrement,
  onDecrement,
  onRemove,
  onUpdateWishes,
  maxQuantity = 99,
}: CartItemProps) {
  const lineKopecks = item.product.price * item.quantity;
  const canInc = item.quantity < maxQuantity;
  const canDec = item.quantity > 1;

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.wishes);
  const areaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!editing) setDraft(item.wishes);
  }, [item.wishes, editing]);

  useEffect(() => {
    if (!editing) return;
    areaRef.current?.focus();
  }, [editing]);

  useEffect(() => {
    if (!editing) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDraft(item.wishes);
        setEditing(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editing, item.wishes]);

  const cancelEdit = () => {
    setDraft(item.wishes);
    setEditing(false);
  };

  const saveEdit = () => {
    onUpdateWishes(draft);
    setEditing(false);
  };

  const iconActionClass =
    "shrink-0 cursor-pointer rounded-lg border p-2 transition disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <article className="flex gap-4 rounded-2xl border border-vanilla-200 bg-white p-4 shadow-sm sm:gap-5 sm:p-5">
      <Link
        href={`/product/${item.product.id}`}
        className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-vanilla-200 bg-vanilla-100 sm:h-32 sm:w-32"
        aria-label={`Открыть ${item.product.name}`}
      >
        <Image
          src={item.product.imageUrl || PLACEHOLDER}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 640px) 112px, 128px"
        />
      </Link>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 sm:gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <Link
              href={`/product/${item.product.id}`}
              className="block font-semibold leading-snug text-vanilla-900 hover:text-vanilla-700"
            >
              {item.product.name}
            </Link>
            {item.product.weight ? (
              <p className="mt-0.5 text-xs leading-tight text-vanilla-500 sm:text-sm">
                {item.product.weight}
              </p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-start gap-1.5">
            <button
              type="button"
              disabled={editing}
              onClick={() => {
                setDraft(item.wishes);
                setEditing(true);
              }}
              className={`${iconActionClass} border-vanilla-300 bg-vanilla-50 text-vanilla-700 hover:border-vanilla-400 hover:bg-vanilla-100 hover:text-vanilla-900`}
              aria-label="Изменить пожелание к позиции"
            >
              <PencilIcon />
            </button>
            <button
              type="button"
              onClick={onRemove}
              className={`${iconActionClass} border-red-200 bg-red-50 text-red-600 hover:border-red-400 hover:bg-red-100 hover:text-red-700`}
              aria-label="Удалить позицию из корзины"
            >
              <CartRemoveIcon />
            </button>
          </div>
        </div>

        {editing ? (
          <div className="min-w-0 space-y-2">
            <label htmlFor={`wishes-${item.cartItemId}`} className="sr-only">
              Пожелание к блюду
            </label>
            <textarea
              ref={areaRef}
              id={`wishes-${item.cartItemId}`}
              value={draft}
              onChange={(e) => setDraft(e.target.value.slice(0, WISHES_MAX))}
              maxLength={WISHES_MAX}
              rows={3}
              placeholder="Например: без лука, острее…"
              className="w-full resize-y rounded-xl border border-vanilla-300 bg-white px-3 py-2 text-sm text-vanilla-900 shadow-sm outline-none transition placeholder:text-vanilla-400 focus:border-vanilla-500 focus:ring-2 focus:ring-vanilla-200"
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-vanilla-500">
                {draft.length}/{WISHES_MAX}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="cursor-pointer rounded-lg border border-vanilla-300 bg-white px-3 py-1.5 text-xs font-semibold text-vanilla-800 transition hover:bg-vanilla-50"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={saveEdit}
                  className="cursor-pointer rounded-lg border border-vanilla-500 bg-vanilla-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:border-vanilla-400 hover:bg-vanilla-400"
                >
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        ) : item.wishes.trim() ? (
          <p className="min-w-0 text-sm italic leading-relaxed text-vanilla-600">
            &laquo;{item.wishes}&raquo;
          </p>
        ) : null}

        <div className="mt-auto flex flex-nowrap items-center justify-between gap-3">
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={onDecrement}
              disabled={!canDec}
              className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-vanilla-300 text-lg font-medium text-vanilla-900 transition hover:bg-vanilla-100 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Уменьшить количество"
            >
              −
            </button>
            <span className="min-w-8 shrink-0 px-2 text-center text-sm font-semibold tabular-nums text-vanilla-900">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={onIncrement}
              disabled={!canInc}
              className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-vanilla-300 text-lg font-medium text-vanilla-900 transition hover:bg-vanilla-100 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Увеличить количество"
            >
              +
            </button>
          </div>
          <p className="shrink-0 whitespace-nowrap text-sm font-semibold text-vanilla-800">
            {formatPriceFromKopecks(lineKopecks)}
          </p>
        </div>
      </div>
    </article>
  );
}
