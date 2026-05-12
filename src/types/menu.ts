/**
 * Категория в ответе меню (совпадает с `/api/categories`, дублируется для автономности типов страницы).
 */
export type MenuCategory = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
};

/**
 * Товар в списке меню (`GET /api/products`).
 */
export type MenuProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  weight: string | null;
  /** Цена в копейках */
  price: number;
  isStopList: boolean;
  /** Для публичного меню обычно `false`; поле сохранено для согласованности с карточкой */
  isHidden: boolean;
  categoryId: string;
  category: {
    id: string;
    name: string;
    slug: string;
    sortOrder: number;
  };
};
