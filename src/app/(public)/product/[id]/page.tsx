import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/seo/JsonLd";
import { getPublicProductById } from "@/lib/public-product";
import { absoluteUrl, buildMetadata, truncateDescription } from "@/lib/seo";

import { ProductPageClient } from "./ProductPageClient";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getPublicProductById(id);

  if (!product) {
    return buildMetadata({
      title: "Товар не найден",
      description: "Запрошенная позиция меню не найдена или временно недоступна.",
      path: `/product/${id}`,
      noIndex: true,
    });
  }

  const description = truncateDescription(
    product.description ??
      `${product.name} — ${product.venue.name}, ${product.category.name}. Цена ${product.price / 100} ₽.`,
  );

  return buildMetadata({
    title: `${product.name} — ${product.venue.name}`,
    description,
    path: `/product/${product.id}`,
    image: product.imageUrl,
  });
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getPublicProductById(id);
  if (!product) notFound();

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    image: absoluteUrl(product.imageUrl || "/og-image.svg"),
    sku: product.id,
    category: product.category.name,
    brand: {
      "@type": "Brand",
      name: product.venue.name,
    },
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/product/${product.id}`),
      price: product.price / 100,
      priceCurrency: "RUB",
      availability: product.isStopList
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
    },
  };

  return (
    <div className="bg-[#f6f1ea] px-4 py-8 text-[#1a1a1a] sm:px-6 lg:py-10">
      <JsonLd data={productJsonLd} />
      <nav
        className="mx-auto mb-6 flex max-w-7xl flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[#1a1a1a]/55"
        aria-label="Хлебные крошки"
      >
        <Link href="/" className="transition hover:text-[#5a2e2e] hover:underline">
          Главная
        </Link>
        <span aria-hidden>/</span>
        <Link href="/menu" className="transition hover:text-[#5a2e2e] hover:underline">
          Меню
        </Link>
        <span aria-hidden>/</span>
        <Link
          href={`/menu?category=${encodeURIComponent(product.category.slug)}`}
          className="transition hover:text-[#5a2e2e] hover:underline"
        >
          {product.category.name}
        </Link>
        <span aria-hidden>/</span>
        <span className="font-medium text-[#1a1a1a]">{product.name}</span>
      </nav>

      <ProductPageClient product={product} />
    </div>
  );
}
