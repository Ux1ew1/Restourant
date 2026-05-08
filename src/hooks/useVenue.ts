import { useVenueStore } from "@/store/venueStore";

/**
 * Обёртка над `venueStore` с удобным доступом к выбору города/заведения.
 */
export function useVenue() {
  const selectedCity = useVenueStore((s) => s.selectedCity);
  const selectedVenue = useVenueStore((s) => s.selectedVenue);
  const isVenuePickerOpen = useVenueStore((s) => s.isVenuePickerOpen);
  const venuePickerStep = useVenueStore((s) => s.venuePickerStep);
  const setCity = useVenueStore((s) => s.setCity);
  const setVenue = useVenueStore((s) => s.setVenue);
  const clear = useVenueStore((s) => s.clear);
  const openVenuePicker = useVenueStore((s) => s.openVenuePicker);
  const closeVenuePicker = useVenueStore((s) => s.closeVenuePicker);
  const setVenuePickerStep = useVenueStore((s) => s.setVenuePickerStep);

  return {
    selectedCity,
    selectedVenue,
    isVenuePickerOpen,
    venuePickerStep,
    setCity,
    setVenue,
    clear,
    openVenuePicker,
    closeVenuePicker,
    setVenuePickerStep,
  };
}
