"use client";

import { useEffect, useMemo, useState } from "react";

import { CityModal } from "@/components/modals/CityModal";
import { VenueModal } from "@/components/modals/VenueModal";
import { useVenue } from "@/hooks/useVenue";
import type { City, Venue } from "@/store/venueStore";

export default function HomePage() {
  const { selectedCity, selectedVenue, setCity, setVenue } = useVenue();
  const [step, setStep] = useState<"closed" | "city" | "venue">("closed");

  useEffect(() => {
    if (selectedVenue) {
      setStep("closed");
      return;
    }
    if (selectedCity) {
      setStep("venue");
      return;
    }
    setStep("city");
  }, [selectedCity, selectedVenue]);

  const venueCityName = useMemo(() => selectedCity?.name ?? "Город", [selectedCity]);

  const handleSelectCity = (city: City) => {
    setCity(city);
    setStep("venue");
  };

  const handleSelectVenue = (venue: Venue) => {
    setVenue(venue);
    setStep("closed");
  };

  return (
    <main className="min-h-dvh bg-vanilla-50 px-6 py-10 text-vanilla-900">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold text-vanilla-800">Restaurant</h1>
        <p className="mt-3 text-vanilla-700">
          {selectedVenue
            ? `Вы выбрали: ${selectedVenue.name} — ${selectedVenue.address}`
            : "Выберите город и заведение, чтобы продолжить."}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-xl border border-vanilla-200 bg-white px-4 py-2 text-sm font-medium text-vanilla-800 hover:bg-vanilla-100"
            onClick={() => setStep("city")}
          >
            {selectedCity ? `Город: ${selectedCity.name}` : "Выбрать город"}
          </button>
          <button
            type="button"
            className="rounded-xl border border-vanilla-200 bg-white px-4 py-2 text-sm font-medium text-vanilla-800 hover:bg-vanilla-100 disabled:opacity-50"
            disabled={!selectedCity}
            onClick={() => setStep("venue")}
          >
            {selectedVenue ? `Заведение: ${selectedVenue.name}` : "Выбрать заведение"}
          </button>
        </div>
      </div>

      <CityModal open={step === "city"} onSelectCity={handleSelectCity} />
      {selectedCity ? (
        <VenueModal
          open={step === "venue"}
          cityId={selectedCity.id}
          cityName={venueCityName}
          onBack={() => setStep("city")}
          onSelectVenue={handleSelectVenue}
        />
      ) : null}
    </main>
  );
}

