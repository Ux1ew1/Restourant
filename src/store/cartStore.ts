import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Минимальная корзина для этапа 4 (бейдж в шапке).
 *
 * Полная логика (позиции, пожелания, persist структуры) будет на этапе 8.
 */
interface CartStore {
  /** Число товарных единиц в корзине (сумма quantity по строкам) */
  totalQuantity: number;

  /**
   * Устанавливает отображаемое количество для бейджа (временный API до этапа 8).
   * На этапе 8 заменится на addItem/removeItem и расчёт из items.
   */
  setTotalQuantity: (n: number) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      totalQuantity: 0,
      setTotalQuantity: (n) => set({ totalQuantity: Math.max(0, Math.floor(n)) }),
    }),
    { name: "cart-storage", partialize: (s) => ({ totalQuantity: s.totalQuantity }) },
  ),
);
