import type { Metadata } from "next";

import { CartPageClient } from "./CartPageClient";

export const metadata: Metadata = {
  title: "Корзина",
  description: "Позиции заказа, количество и сумма перед оформлением.",
};

/**
 * Страница корзины: список товаров и переход к оформлению заказа.
 */
export default function CartPage() {
  return <CartPageClient />;
}
