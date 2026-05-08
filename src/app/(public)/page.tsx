import type { Metadata } from "next";

import { HomePageClient } from "./HomePageClient";

export const metadata: Metadata = {
  title: "Главная",
  description:
    "Заказ блюд на доставку и самовывоз: меню ресторана, акции и популярные позиции. Выберите заведение и оформите заказ онлайн.",
};

/**
 * Главная страница витрины: hero, новости, популярное и быстрые ссылки на категории.
 *
 * Данные по заведению подгружаются на клиенте после выбора точки (`venueStore`);
 * мета-теги по умолчанию задаются здесь, а уточнение title/description выполняется
 * в `HomeMetadataEffect` при известном заведении.
 */
export default function HomePage() {
  return <HomePageClient />;
}
