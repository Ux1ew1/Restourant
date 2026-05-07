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

/**
 * Стор выбора города и заведения.
 *
 * Хранит выбор пользователя и персистит его в localStorage, чтобы при повторном визите
 * не показывать модальное окно выбора.
 */
interface VenueStore {
  /** Выбранный город (null до выбора) */
  selectedCity: City | null;
  /** Выбранное заведение (null до выбора) */
  selectedVenue: Venue | null;

  /** Устанавливает выбранный город и сбрасывает заведение (если оно было) */
  setCity: (city: City | null) => void;
  /** Устанавливает выбранное заведение */
  setVenue: (venue: Venue | null) => void;
  /** Сбрасывает выбор полностью */
  clear: () => void;
}

export const useVenueStore = create<VenueStore>()(
  persist(
    (set) => ({
      selectedCity: null,
      selectedVenue: null,
      setCity: (city) => set({ selectedCity: city, selectedVenue: null }),
      setVenue: (venue) => set({ selectedVenue: venue }),
      clear: () => set({ selectedCity: null, selectedVenue: null }),
    }),
    { name: "venue-storage" },
  ),
);

