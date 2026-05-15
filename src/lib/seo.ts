import type { Metadata } from "next";

import { prisma } from "@/lib/prisma";

export const SITE_NAME = "Restaurant";
export const DEFAULT_OG_IMAGE = "/og-image.svg";

type SeoMetadataInput = {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  noIndex?: boolean;
};

export function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXTAUTH_URL ??
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

export function absoluteUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  return `${getSiteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

export function truncateDescription(value: string, maxLength = 160) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}

export function buildMetadata({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  noIndex = false,
}: SeoMetadataInput): Metadata {
  const canonical = absoluteUrl(path);
  const imageUrl = absoluteUrl(image || DEFAULT_OG_IMAGE);

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: "ru_RU",
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: SITE_NAME,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    robots: noIndex ? { index: false, follow: false } : undefined,
  };
}

export async function getPrimaryVenueSeoContext() {
  try {
    return await prisma.venue.findFirst({
      where: {
        isActive: true,
        city: { isActive: true },
      },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        address: true,
        phone: true,
        logoUrl: true,
        city: { select: { name: true, slug: true } },
        categories: {
          where: { isActive: true },
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
          select: {
            id: true,
            name: true,
            slug: true,
            products: {
              where: { isHidden: false },
              orderBy: { name: "asc" },
              select: {
                id: true,
                name: true,
                description: true,
                imageUrl: true,
                price: true,
                weight: true,
              },
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("[seo] Failed to load primary venue context", error);
    return null;
  }
}

export function getVenueDescription(
  venue: Awaited<ReturnType<typeof getPrimaryVenueSeoContext>>,
) {
  if (!venue) {
    return "Заказ блюд на доставку и самовывоз: меню ресторана, акции и популярные позиции. Выберите заведение и оформите заказ онлайн.";
  }

  const city = venue.city?.name ? `${venue.city.name}, ` : "";
  return truncateDescription(
    `${city}${venue.name}: меню, акции, доставка и самовывоз. Адрес: ${venue.address}. Оформите заказ онлайн.`,
  );
}

export function getRestaurantJsonLd(
  venue: Awaited<ReturnType<typeof getPrimaryVenueSeoContext>>,
) {
  if (!venue) return null;

  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: venue.name,
    url: absoluteUrl("/"),
    image: absoluteUrl(venue.logoUrl || DEFAULT_OG_IMAGE),
    address: {
      "@type": "PostalAddress",
      addressLocality: venue.city?.name,
      streetAddress: venue.address,
      addressCountry: "RU",
    },
    telephone: venue.phone ?? undefined,
    servesCuisine: "Restaurant",
    hasMenu: absoluteUrl("/menu"),
  };
}

export function getOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: absoluteUrl("/"),
    logo: absoluteUrl(DEFAULT_OG_IMAGE),
  };
}

export function getMenuJsonLd(
  venue: Awaited<ReturnType<typeof getPrimaryVenueSeoContext>>,
) {
  if (!venue) return null;

  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: `Меню ${venue.name}`,
    url: absoluteUrl("/menu"),
    hasMenuSection: venue.categories.map((category) => ({
      "@type": "MenuSection",
      name: category.name,
      url: absoluteUrl(`/menu?category=${encodeURIComponent(category.slug)}`),
      hasMenuItem: category.products.map((product) => ({
        "@type": "MenuItem",
        name: product.name,
        description: product.description ?? undefined,
        image: product.imageUrl ? absoluteUrl(product.imageUrl) : undefined,
        offers: {
          "@type": "Offer",
          price: product.price / 100,
          priceCurrency: "RUB",
          availability: "https://schema.org/InStock",
        },
      })),
    })),
  };
}
