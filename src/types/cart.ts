/**
 * Снимок товара в строке корзины (фиксируется на момент добавления).
 */
export type CartLineProduct = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  weight: string | null;
  /** Цена в копейках на момент добавления */
  price: number;
  venueId: string;
};

/**
 * Одна строка корзины: товар, количество и пожелание клиента.
 */
export type CartItem = {
  /** Уникальный id строки (генерируется на клиенте) */
  cartItemId: string;
  product: CartLineProduct;
  quantity: number;
  /** Пожелание к позиции (после trim сравнивается при слиянии строк) */
  wishes: string;
};
