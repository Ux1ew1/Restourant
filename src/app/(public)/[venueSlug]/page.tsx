import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { VenueRouteSync } from "@/components/venue/VenueRouteSync";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  buildMetadata,
  getOrganizationJsonLd,
  getRestaurantJsonLd,
  getVenueDescription,
} from "@/lib/seo";
import { getPublicVenueBySlug } from "@/lib/public-venue";

import { HomePageClient } from "../HomePageClient";

type PageProps = {
  params: Promise<{ venueSlug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { venueSlug } = await params;
  const venue = await getPublicVenueBySlug(venueSlug);

  if (!venue) {
    return buildMetadata({
      title: "Заведение не найдено",
      description: "Запрошенное заведение не найдено или временно недоступно.",
      path: `/${venueSlug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: `${venue.name} - главная`,
    description: getVenueDescription(venue),
    path: `/${venue.slug}`,
    image: venue.logoUrl,
  });
}

export default async function VenueHomePage({ params }: PageProps) {
  const { venueSlug } = await params;
  const venue = await getPublicVenueBySlug(venueSlug);

  if (!venue) notFound();

  const city = venue.city;
  const routeVenue = {
    id: venue.id,
    name: venue.name,
    slug: venue.slug,
    cityId: venue.cityId,
    address: venue.address,
    phone: venue.phone,
    logoUrl: venue.logoUrl,
    storyEnabled: venue.storyEnabled,
    storyTitle: venue.storyTitle,
    storyText: venue.storyText,
    bookingEnabled: venue.bookingEnabled,
  };

  return (
    <>
      <JsonLd data={[getOrganizationJsonLd(), getRestaurantJsonLd(venue)].filter(Boolean)} />
      <VenueRouteSync city={city} venue={routeVenue} />
      <HomePageClient initialCity={city} initialVenue={routeVenue} />
    </>
  );
}
