import { prisma } from "@/lib/prisma";
import type { ProductDetail } from "@/types/product";

/**
 * Возвращает товар для публичной витрины по id или `null`, если не найден или скрыт.
 *
 * Товары со `isHidden=true` не отдаются — как в списке меню.
 *
 * @param id - Идентификатор `Product.id`
 */
export async function getPublicProductById(id: string): Promise<ProductDetail | null> {
  const row = await prisma.product.findFirst({
    where: { id, isHidden: false },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      imageUrl: true,
      weight: true,
      composition: true,
      price: true,
      isStopList: true,
      isHidden: true,
      venueId: true,
      category: { select: { id: true, name: true, slug: true } },
      venue: { select: { id: true, name: true } },
    },
  });

  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    imageUrl: row.imageUrl,
    weight: row.weight,
    composition: row.composition,
    price: row.price,
    isStopList: row.isStopList,
    isHidden: row.isHidden,
    venueId: row.venueId,
    category: row.category,
    venue: row.venue,
  };
}
