import type { CartItem } from "@/types/cart";

/**
 * Форматирует цену в рублях из значения в копейках.
 *
 * @param kopecks - Цена в копейках (целое число)
 * @returns Строка вида «690 ₽» (без дробной части, копейки не показываются)
 *
 * @example
 * formatPriceFromKopecks(69000) // → '690 ₽'
 */
export function formatPriceFromKopecks(kopecks: number): string {
  const rub = Math.round(kopecks / 100);
  return `${rub.toLocaleString("ru-RU")} ₽`;
}

/**
 * Сумма корзины в копейках: для каждой строки `цена × количество`.
 *
 * @param items - Строки корзины
 * @returns Сумма в копейках (целое число)
 */
export function sumCartTotalKopecks(items: CartItem[]): number {
  return items.reduce((acc, it) => acc + it.product.price * it.quantity, 0);
}
