import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/JsonLd";
import {
  buildMetadata,
  getOrganizationJsonLd,
  getPrimaryVenueSeoContext,
  getRestaurantJsonLd,
  getVenueDescription,
} from "@/lib/seo";

import { HomePageClient } from "./HomePageClient";

export async function generateMetadata(): Promise<Metadata> {
  const venue = await getPrimaryVenueSeoContext();

  return buildMetadata({
    title: venue ? `${venue.name} — главная` : "Главная",
    description: getVenueDescription(venue),
    path: "/",
    image: venue?.logoUrl,
  });
}

export default async function HomePage() {
  const venue = await getPrimaryVenueSeoContext();

  return (
    <>
      <JsonLd data={[getOrganizationJsonLd(), getRestaurantJsonLd(venue)].filter(Boolean)} />
      <HomePageClient />
    </>
  );
}
