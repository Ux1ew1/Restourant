import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getPublicProductById } from "@/lib/public-product";

import { ProductPageClient } from "./ProductPageClient";

type PageProps = {
  params: Promise<{ id: string }>;
};

/**
 * Страница товара: серверная загрузка данных, метаданные и хлебные крошки.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getPublicProductById(id);
  if (!product) {
    return { title: "Товар не найден" };
  }
  return {
    title: product.name,
    description:
      product.description?.slice(0, 160) ??
      `${product.name} — ${product.venue.name}, ${product.category.name}`,
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getPublicProductById(id);
  if (!product) notFound();

  return (
    <div>
      <nav className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-vanilla-600" aria-label="Хлебные крошки">
        <Link href="/" className="transition hover:text-vanilla-900 hover:underline">
          Главная
        </Link>
        <span aria-hidden>/</span>
        <Link href="/menu" className="transition hover:text-vanilla-900 hover:underline">
          Меню
        </Link>
        <span aria-hidden>/</span>
        <Link
          href={`/menu?category=${encodeURIComponent(product.category.slug)}`}
          className="transition hover:text-vanilla-900 hover:underline"
        >
          {product.category.name}
        </Link>
        <span aria-hidden>/</span>
        <span className="font-medium text-vanilla-900">{product.name}</span>
      </nav>

      <ProductPageClient product={product} />
    </div>
  );
}
