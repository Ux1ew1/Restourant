import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { JsonLd } from "@/components/seo/JsonLd";
import { VenueRouteSync } from "@/components/venue/VenueRouteSync";
import { buildMetadata, getMenuJsonLd, getVenueDescription } from "@/lib/seo";
import { getPublicVenueBySlug } from "@/lib/public-venue";

import { MenuPageClient } from "../../menu/MenuPageClient";

type PageProps = {
  params: Promise<{ venueSlug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { venueSlug } = await params;
  const venue = await getPublicVenueBySlug(venueSlug);

  if (!venue) {
    return buildMetadata({
      title: "Меню не найдено",
      description: "Меню запрошенного заведения не найдено или временно недоступно.",
      path: `/${venueSlug}/menu`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: `Меню ${venue.name}`,
    description: getVenueDescription(venue),
    path: `/${venue.slug}/menu`,
    image: venue.logoUrl,
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

export default async function VenueMenuPage({ params }: PageProps) {
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
      <JsonLd data={getMenuJsonLd(venue)} />
      <VenueRouteSync city={city} venue={routeVenue} />
      <Suspense fallback={<MenuFallback />}>
        <MenuPageClient initialCity={city} initialVenue={routeVenue} />
      </Suspense>
    </>
  );
}
