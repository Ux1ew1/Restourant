import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";

import { CartPageClient } from "./CartPageClient";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "Корзина",
    description: "Проверьте позиции заказа, количество и сумму перед оформлением.",
    path: "/cart",
    noIndex: true,
  });
}

export default function CartPage() {
  return <CartPageClient />;
}
