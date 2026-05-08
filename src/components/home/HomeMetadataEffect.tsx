"use client";

import { useEffect } from "react";

import type { City, Venue } from "@/store/venueStore";

const DEFAULT_TITLE = "Главная | Restaurant";
const DEFAULT_DESCRIPTION =
  "Заказ блюд на доставку и самовывоз: меню ресторана, акции и популярные позиции. Выберите заведение и оформите заказ онлайн.";

/** Пропсы эффекта обновления `<title>` и meta description в браузере */
interface HomeMetadataEffectProps {
  /** Выбранный город (для уточнения описания) */
  city: City | null;
  /** Выбранное заведение; при отсутствии используются дефолтные мета-тексты */
  venue: Venue | null;
}

/**
 * Обновляет `document.title` и `<meta name="description">` после выбора заведения.
 *
 * Выбор точки хранится в `localStorage`, поэтому серверный `generateMetadata` не знает контекст;
 * для живых пользователей заголовок и описание синхронизируются на клиенте после гидрации.
 *
 * @param city - Город витрины
 * @param venue - Активное заведение или `null`
 *
 * @example
 * <HomeMetadataEffect city={selectedCity} venue={selectedVenue} />
 */
export function HomeMetadataEffect({ city, venue }: HomeMetadataEffectProps) {
  useEffect(() => {
    if (venue) {
      const cityPart = city?.name ? `${city.name} · ` : "";
      document.title = `${venue.name} — главная | Restaurant`;
      const desc = `${cityPart}${venue.name}: меню, акции и заказ онлайн. ${venue.address}`.trim();
      setMetaDescription(desc);
      return;
    }

    document.title = DEFAULT_TITLE;
    setMetaDescription(DEFAULT_DESCRIPTION);
  }, [city, venue]);

  return null;
}

function setMetaDescription(content: string) {
  let el = document.querySelector('meta[name="description"]');
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", "description");
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}
