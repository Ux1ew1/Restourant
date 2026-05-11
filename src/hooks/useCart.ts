import { useCartStore } from "@/store/cartStore";

/**
 * Обёртка над корзиной: строки, суммарное количество для бейджа,
 * `addItem` / `removeItem` / `updateQuantity` / `updateWishes` / `clear`.
 */
export function useCart() {
  const items = useCartStore((s) => s.items);
  const totalQuantity = useCartStore((s) => s.totalQuantity);
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const updateWishes = useCartStore((s) => s.updateWishes);
  const clear = useCartStore((s) => s.clear);

  return { items, totalQuantity, addItem, removeItem, updateQuantity, updateWishes, clear };
}
