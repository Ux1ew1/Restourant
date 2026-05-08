import { create } from "zustand";
import { persist } from "zustand/middleware";

export type City = {
  id: string;
  name: string;
  slug: string;
};

export type Venue = {
  id: string;
  name: string;
  slug: string;
  cityId: string;
  address: string;
  phone?: string | null;
  logoUrl?: string | null;
};

export type VenuePickerStep = "city" | "venue";

/**
 * Стор выбора города и заведения.
 *
 * Хранит выбор пользователя и персистит его в localStorage, чтобы при повторном визите
 * не показывать модальное окно выбора. Состояние открытия модалок в персист не входит.
 */
interface VenueStore {
  /** Выбранный город (null до выбора) */
  selectedCity: City | null;
  /** Выбранное заведение (null до выбора) */
  selectedVenue: Venue | null;

  /** Открыт ли мастер выбора города/заведения */
  isVenuePickerOpen: boolean;
  /** Текущий шаг мастера */
  venuePickerStep: VenuePickerStep;

  /** Устанавливает выбранный город и сбрасывает заведение (если оно было) */
  setCity: (city: City | null) => void;
  /** Устанавливает выбранное заведение */
  setVenue: (venue: Venue | null) => void;
  /** Сбрасывает выбор полностью */
  clear: () => void;

  /** Открывает мастер выбора (по умолчанию — город, если город уже есть — заведения) */
  openVenuePicker: (step?: VenuePickerStep) => void;
  closeVenuePicker: () => void;
  setVenuePickerStep: (step: VenuePickerStep) => void;
}

export const useVenueStore = create<VenueStore>()(
  persist(
    (set, get) => ({
      selectedCity: null,
      selectedVenue: null,
      isVenuePickerOpen: false,
      venuePickerStep: "city",

      setCity: (city) =>
        set({
          selectedCity: city,
          selectedVenue: null,
          venuePickerStep: city ? "venue" : "city",
        }),

      setVenue: (venue) =>
        set({
          selectedVenue: venue,
          isVenuePickerOpen: false,
        }),

      clear: () =>
        set({
          selectedCity: null,
          selectedVenue: null,
          venuePickerStep: "city",
        }),

      openVenuePicker: (step) =>
        set({
          isVenuePickerOpen: true,
          venuePickerStep: step ?? (get().selectedCity ? "venue" : "city"),
        }),

      closeVenuePicker: () => set({ isVenuePickerOpen: false }),

      setVenuePickerStep: (venuePickerStep) => set({ venuePickerStep }),
    }),
    {
      name: "venue-storage",
      partialize: (state) => ({
        selectedCity: state.selectedCity,
        selectedVenue: state.selectedVenue,
      }),
    },
  ),
);
