import type { Metadata } from "next";

import { auth } from "@/lib/auth";
import { CheckoutPageClient } from "./CheckoutPageClient";

export const metadata: Metadata = {
  title: "Оформление заказа",
  description: "Доставка или самовывоз — выберите удобный способ получения и оплаты.",
};

/**
 * Страница оформления заказа.
 *
 * Серверный компонент: получает сессию пользователя и передаёт телефон
 * в клиентский компонент для предзаполнения формы.
 */
export default async function CheckoutPage() {
  const session = await auth();
  const defaultPhone = session?.user?.phone ?? undefined;

  return <CheckoutPageClient defaultPhone={defaultPhone} />;
}
