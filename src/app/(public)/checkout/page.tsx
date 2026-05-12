import type { Metadata } from "next";

import { auth } from "@/lib/auth";
import { buildMetadata } from "@/lib/seo";

import { CheckoutPageClient } from "./CheckoutPageClient";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "Оформление заказа",
    description:
      "Выберите доставку или самовывоз, укажите контакты и удобный способ оплаты.",
    path: "/checkout",
    noIndex: true,
  });
}

export default async function CheckoutPage() {
  const session = await auth();
  const defaultPhone = session?.user?.phone ?? undefined;

  return <CheckoutPageClient defaultPhone={defaultPhone} />;
}
