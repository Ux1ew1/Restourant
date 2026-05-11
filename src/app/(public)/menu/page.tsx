import type { Metadata } from "next";
import { Suspense } from "react";

import { MenuPageClient } from "./MenuPageClient";

export const metadata: Metadata = {
  title: "Меню",
  description:
    "Категории и блюда выбранного заведения: цены, граммовки и быстрый заказ онлайн.",
};

function MenuFallback() {
  return (
    <div className="animate-pulse space-y-8" aria-hidden>
      <div className="h-9 w-48 rounded-lg bg-vanilla-200" />
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="h-28 w-full rounded-2xl bg-vanilla-200 lg:h-72 lg:w-56" />
        <div className="grid flex-1 gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((k) => (
            <div key={k} className="h-64 rounded-2xl bg-vanilla-200" />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Страница меню заведения: категории и сетка товаров с фильтром по query `category`.
 */
export default function MenuPage() {
  return (
    <Suspense fallback={<MenuFallback />}>
      <MenuPageClient />
    </Suspense>
  );
}
