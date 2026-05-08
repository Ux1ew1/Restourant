import { useCartStore } from "@/store/cartStore";

/**
 * Обёртка над корзиной: количество позиций для бейджа в шапке.
 */
export function useCart() {
  const totalQuantity = useCartStore((s) => s.totalQuantity);
  return { totalQuantity };
}
