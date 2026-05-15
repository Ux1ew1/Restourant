"use client";

import { useEffect } from "react";

import type { City, Venue } from "@/store/venueStore";
import { useVenueStore } from "@/store/venueStore";

interface VenueRouteSyncProps {
  city: City;
  venue: Venue;
}

export function VenueRouteSync({ city, venue }: VenueRouteSyncProps) {
  const setCity = useVenueStore((s) => s.setCity);
  const setVenue = useVenueStore((s) => s.setVenue);

  useEffect(() => {
    setCity(city);
    setVenue(venue);
  }, [city, setCity, setVenue, venue]);

  return null;
}
