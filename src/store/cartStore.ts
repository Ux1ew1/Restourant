import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { CartItem, CartLineProduct } from "@/types/cart";

function newCartItemId(): string {
  if (typeof globalThis !== "undefined" && globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  return `line_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function sumQuantity(items: CartItem[]): number {
  return items.reduce((acc, it) => acc + it.quantity, 0);
}

/**
 * Стор корзины: строки с товаром, количеством и пожеланием; суммарное число единиц для бейджа.
 *
 * Данные персистятся в `localStorage` под ключом `restaurant-cart` (этап 7+). Ранее использовался
 * только счётчик бейджа — при первом открытии после обновления список строк начинается пустым.
 */
interface CartStore {
  /** Строки корзины */
  items: CartItem[];
  /** Сумма `quantity` по строкам — для бейджа в шапке */
  totalQuantity: number;

  /**
   * Добавляет товар в корзину.
   * Если уже есть строка с тем же `product.id` и тем же пожеланием (после trim) — увеличивает `quantity`.
   *
   * @param product - Снимок товара
   * @param quantity - Сколько единиц добавить (минимум 1)
   * @param wishes - Пожелание клиента
   */
  addItem: (product: CartLineProduct, quantity?: number, wishes?: string) => void;

  /** Удаляет строку по `cartItemId` */
  removeItem: (cartItemId: string) => void;

  /**
   * Устанавливает количество в строке; при `quantity <= 0` строка удаляется.
   *
   * @param cartItemId - Идентификатор строки
   * @param quantity - Новое количество
   */
  updateQuantity: (cartItemId: string, quantity: number) => void;

  /**
   * Обновляет пожелание в строке (после trim).
   * Если уже есть другая строка с тем же товаром и таким же пожеланием — объединяет количество в одну строку.
   *
   * @param cartItemId - Идентификатор строки
   * @param wishes - Новый текст пожелания
   */
  updateWishes: (cartItemId: string, wishes: string) => void;

  /** Очищает корзину */
  clear: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      totalQuantity: 0,

      addItem: (product, quantity = 1, wishes = "") => {
        const qty = Math.max(1, Math.floor(quantity));
        const w = (wishes ?? "").trim();
        set((s) => {
          const idx = s.items.findIndex(
            (it) => it.product.id === product.id && (it.wishes ?? "").trim() === w,
          );
          let next: CartItem[];
          if (idx >= 0) {
            next = s.items.map((it, i) =>
              i === idx ? { ...it, quantity: it.quantity + qty } : it,
            );
          } else {
            next = [
              ...s.items,
              {
                cartItemId: newCartItemId(),
                product,
                quantity: qty,
                wishes: w,
              },
            ];
          }
          return { items: next, totalQuantity: sumQuantity(next) };
        });
      },

      removeItem: (cartItemId) =>
        set((s) => {
          const next = s.items.filter((it) => it.cartItemId !== cartItemId);
          return { items: next, totalQuantity: sumQuantity(next) };
        }),

      updateQuantity: (cartItemId, quantity) =>
        set((s) => {
          const q = Math.floor(quantity);
          if (q <= 0) {
            const next = s.items.filter((it) => it.cartItemId !== cartItemId);
            return { items: next, totalQuantity: sumQuantity(next) };
          }
          const next = s.items.map((it) =>
            it.cartItemId === cartItemId ? { ...it, quantity: q } : it,
          );
          return { items: next, totalQuantity: sumQuantity(next) };
        }),

      updateWishes: (cartItemId, wishes) =>
        set((s) => {
          const w = (wishes ?? "").trim();
          const curIdx = s.items.findIndex((it) => it.cartItemId === cartItemId);
          if (curIdx < 0) return s;
          const cur = s.items[curIdx];
          const otherIdx = s.items.findIndex(
            (it) =>
              it.cartItemId !== cartItemId &&
              it.product.id === cur.product.id &&
              (it.wishes ?? "").trim() === w,
          );

          if (otherIdx >= 0) {
            const other = s.items[otherIdx];
            const next = s.items
              .filter((it) => it.cartItemId !== cartItemId)
              .map((it) =>
                it.cartItemId === other.cartItemId
                  ? { ...it, quantity: it.quantity + cur.quantity }
                  : it,
              );
            return { items: next, totalQuantity: sumQuantity(next) };
          }

          const next = s.items.map((it) =>
            it.cartItemId === cartItemId ? { ...it, wishes: w } : it,
          );
          return { items: next, totalQuantity: sumQuantity(next) };
        }),

      clear: () => set({ items: [], totalQuantity: 0 }),
    }),
    {
      name: "restaurant-cart",
      partialize: (s) => ({ items: s.items, totalQuantity: s.totalQuantity }),
    },
  ),
);
