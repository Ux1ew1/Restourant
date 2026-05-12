/**
 * Публичная карточка товара для страницы детали и API `GET /api/products/[id]`.
 */
export type ProductDetail = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  weight: string | null;
  composition: string | null;
  /** Цена в копейках */
  price: number;
  isStopList: boolean;
  isHidden: boolean;
  venueId: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  venue: {
    id: string;
    name: string;
  };
};
