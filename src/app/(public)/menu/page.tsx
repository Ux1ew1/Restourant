import type { Metadata } from "next";
import { Suspense } from "react";

import { JsonLd } from "@/components/seo/JsonLd";
import {
  buildMetadata,
  getMenuJsonLd,
  getPrimaryVenueSeoContext,
  getVenueDescription,
} from "@/lib/seo";

import { MenuPageClient } from "./MenuPageClient";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const venue = await getPrimaryVenueSeoContext();

  return buildMetadata({
    title: venue ? `Меню ${venue.name}` : "Меню",
    description: venue
      ? getVenueDescription(venue)
      : "Категории и блюда ресторана: цены, граммовки и быстрый заказ онлайн.",
    path: "/menu",
    image: venue?.logoUrl,
  });
}

function MenuFallback() {
  return (
    <div className="animate-pulse space-y-8" aria-hidden>
      <div className="h-9 w-48 rounded-lg bg-vanilla-200" />
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="h-28 w-full rounded-2xl bg-vanilla-200 lg:h-72 lg:w-56" />
        <div className="grid flex-1 gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((k) => (
            <div key={k} className="h-64 rounded-2xl bg-vanilla-200" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function MenuPage() {
  const venue = await getPrimaryVenueSeoContext();

  return (
    <>
      <JsonLd data={getMenuJsonLd(venue)} />
      <Suspense fallback={<MenuFallback />}>
        <MenuPageClient />
      </Suspense>
    </>
  );
}
