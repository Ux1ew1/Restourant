/**
 * Новостной баннер для главной страницы (ответ API `/api/news`).
 */
export type HomeNewsItem = {
  /** Идентификатор записи */
  id: string;
  /** Заголовок баннера */
  title: string;
  /** URL изображения; может быть пустым */
  imageUrl: string | null;
  /** Краткий текст под заголовком */
  content: string | null;
  /** Дата публикации (ISO) */
  publishedAt: string;
  /** Заведение или `null`, если баннер общий для витрины */
  venueId: string | null;
};

/**
 * Карточка популярного товара на главной (ответ API `/api/products/popular`).
 */
export type HomePopularProduct = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  weight: string | null;
  /** Цена в копейках */
  price: number;
  isStopList: boolean;
};

/**
 * Категория меню для быстрых ссылок (ответ API `/api/categories`).
 */
export type HomeCategory = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
};
