import { useVenueStore } from "@/store/venueStore";

/**
 * Обёртка над `venueStore` с удобным доступом к выбору города/заведения.
 */
export function useVenue() {
  const selectedCity = useVenueStore((s) => s.selectedCity);
  const selectedVenue = useVenueStore((s) => s.selectedVenue);
  const setCity = useVenueStore((s) => s.setCity);
  const setVenue = useVenueStore((s) => s.setVenue);
  const clear = useVenueStore((s) => s.clear);

  return { selectedCity, selectedVenue, setCity, setVenue, clear };
}

