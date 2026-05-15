"use client";

import { useCallback, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { VenuePicker } from "@/components/modals/VenuePicker";
import type { City, Venue } from "@/store/venueStore";
import { useVenueStore } from "@/store/venueStore";

/**
 * Глобальный хост пикера выбора города/заведения (для шапки и первого визита).
 */
export function VenuePickerHost() {
  const pathname = usePathname();
  const router = useRouter();
  const selectedCity = useVenueStore((s) => s.selectedCity);
  const selectedVenue = useVenueStore((s) => s.selectedVenue);
  const isOpen = useVenueStore((s) => s.isVenuePickerOpen);
  const step = useVenueStore((s) => s.venuePickerStep);
  const setCity = useVenueStore((s) => s.setCity);
  const setVenue = useVenueStore((s) => s.setVenue);
  const setVenuePickerStep = useVenueStore((s) => s.setVenuePickerStep);
  const openVenuePicker = useVenueStore((s) => s.openVenuePicker);
  const closeVenuePicker = useVenueStore((s) => s.closeVenuePicker);
  const firstSegment = pathname.split("/").filter(Boolean)[0];
  const isVenueSlugRoute = Boolean(
    firstSegment &&
      !["admin", "api", "cart", "checkout", "login", "menu", "order", "product", "register"].includes(firstSegment),
  );

  useEffect(() => {
    if (!selectedCity?.id) return;

    const ac = new AbortController();
    fetch("/api/cities", { signal: ac.signal })
      .then((r) =>
        r.json() as Promise<{ ok: boolean; cities?: { id: string; name: string; slug: string }[] }>,
      )
      .then((data) => {
        if (!data.ok || !Array.isArray(data.cities)) return;

        if (data.cities.some((city) => city.id === selectedCity.id)) return;

        const fallbackCity = data.cities.find((city) => city.slug === selectedCity.slug) ?? null;
        useVenueStore.getState().setCity(
          fallbackCity
            ? { id: fallbackCity.id, name: fallbackCity.name, slug: fallbackCity.slug }
            : null,
        );
      })
      .catch(() => {});

    return () => ac.abort();
  }, [selectedCity?.id, selectedCity?.slug]);

  /**
   * Сбрасывает выбор заведения, если оно отключено или удалено: в `GET /api/venues` его уже нет,
   * но значение могло остаться в localStorage.
   */
  useEffect(() => {
    if (!selectedCity?.id || !selectedVenue?.id) return;

    const ac = new AbortController();
    fetch(`/api/venues?cityId=${encodeURIComponent(selectedCity.id)}`, { signal: ac.signal })
      .then((r) => r.json() as Promise<{ ok: boolean; venues?: { id: string }[] }>)
      .then((data) => {
        if (!data.ok || !Array.isArray(data.venues)) return;
        if (!data.venues.some((v) => v.id === selectedVenue.id)) {
          useVenueStore.getState().setVenue(null);
        }
      })
      .catch(() => {});

    return () => ac.abort();
  }, [selectedCity?.id, selectedVenue?.id]);

  useEffect(() => {
    const run = () => {
      if (isVenueSlugRoute) return;
      if (useVenueStore.getState().selectedVenue) return;
      openVenuePicker(useVenueStore.getState().selectedCity ? "venue" : "city");
    };
    if (useVenueStore.persist.hasHydrated()) run();
    return useVenueStore.persist.onFinishHydration(run);
  }, [isVenueSlugRoute, openVenuePicker]);


  const handleCity = useCallback((city: City) => {
    setCity(city);
    setVenuePickerStep("venue");
  }, [setCity, setVenuePickerStep]);

  const handleVenue = useCallback((venue: Venue) => {
    setVenue(venue);
    const isMenuPage = pathname === "/menu" || pathname.endsWith("/menu");
    router.push(isMenuPage ? `/${venue.slug}/menu` : `/${venue.slug}`);
  }, [pathname, router, setVenue]);


  return (
    <VenuePicker
      open={isOpen}
      step={step}
      selectedCity={selectedCity}
      onSelectCity={handleCity}
      onSelectVenue={handleVenue}
      onBack={() => setVenuePickerStep("city")}
      onClose={closeVenuePicker}
    />
  );
}
