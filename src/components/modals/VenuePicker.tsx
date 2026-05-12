"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import type { City, Venue } from "@/store/venueStore";

type CitiesResponse =
  | { ok: true; cities: Array<{ id: string; name: string; slug: string; isActive: boolean }> }
  | { ok: false; error: string };

type VenuesResponse =
  | {
      ok: true;
      venues: Array<{
        id: string;
        name: string;
        slug: string;
        cityId: string;
        address: string;
        phone?: string | null;
        logoUrl?: string | null;
        isActive: boolean;
      }>;
    }
  | { ok: false; error: string };

const slideVariants = {
  enterFromRight: { x: "100%", opacity: 0 },
  enterFromLeft: { x: "-100%", opacity: 0 },
  center: { x: 0, opacity: 1 },
  exitToLeft: { x: "-100%", opacity: 0 },
  exitToRight: { x: "100%", opacity: 0 },
};

/**
 * Единый пикер города и заведения.
 *
 * Отображается как вертикальный прямоугольник с двумя слайдами:
 * — шаг «city»: компактный список городов
 * — шаг «venue»: компактный список заведений (тот же стиль)
 * Переход между шагами — горизонтальный слайд.
 */
export function VenuePicker({
  open,
  step,
  selectedCity,
  onSelectCity,
  onSelectVenue,
  onBack,
  onClose,
}: {
  open: boolean;
  step: "city" | "venue";
  selectedCity: City | null;
  onSelectCity: (city: City) => void;
  onSelectVenue: (venue: Venue) => void;
  onBack: () => void;
  onClose: () => void;
}) {
  const [cities, setCities] = useState<City[] | null>(null);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [citiesError, setCitiesError] = useState<string | null>(null);
  const [cityCount, setCityCount] = useState(0);

  const [venues, setVenues] = useState<Venue[] | null>(null);
  const [venuesLoading, setVenuesLoading] = useState(false);
  const [venuesError, setVenuesError] = useState<string | null>(null);

  const prevStep = useRef<"city" | "venue">(step);
  const direction = step === "venue" ? 1 : -1;

  useEffect(() => {
    prevStep.current = step;
  }, [step]);

  useEffect(() => {
    if (!open || step !== "city") return;
    if (cities) return;
    const controller = new AbortController();
    setCitiesLoading(true);
    setCitiesError(null);

    fetch("/api/cities", { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error("HTTP");
        return r.json() as Promise<CitiesResponse>;
      })
      .then((data) => {
        if (controller.signal.aborted) return;
        if (!data.ok || !Array.isArray(data.cities)) {
          setCitiesError("Не удалось загрузить города");
          return;
        }
        const mapped = data.cities.map((c) => ({ id: c.id, name: c.name, slug: c.slug }));
        setCityCount(mapped.length);
        if (mapped.length === 1) {
          onSelectCity(mapped[0]);
          return;
        }
        setCities(mapped);
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setCitiesError("Не удалось загрузить города");
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        setCitiesLoading(false);
      });

    return () => controller.abort();
  }, [open, step, cities, onSelectCity]);

  useEffect(() => {
    if (!open || step !== "venue" || !selectedCity) return;
    const controller = new AbortController();
    setVenuesLoading(true);
    setVenuesError(null);
    setVenues(null);

    fetch(`/api/venues?cityId=${encodeURIComponent(selectedCity.id)}`, {
      signal: controller.signal,
    })
      .then((r) => {
        if (!r.ok) throw new Error("HTTP");
        return r.json() as Promise<VenuesResponse>;
      })
      .then((data) => {
        if (controller.signal.aborted) return;
        if (!data.ok || !Array.isArray(data.venues)) {
          setVenuesError("Не удалось загрузить заведения");
          return;
        }
        setVenues(
          data.venues.map((v) => ({
            id: v.id,
            name: v.name,
            slug: v.slug,
            cityId: v.cityId,
            address: v.address,
            phone: v.phone ?? null,
            logoUrl: v.logoUrl ?? null,
          })),
        );
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setVenuesError("Не удалось загрузить заведения");
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        setVenuesLoading(false);
      });

    return () => controller.abort();
  }, [open, step, selectedCity]);

  const canGoBackToCity = cityCount > 1;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-modal="true"
          role="dialog"
          onMouseDown={(event) => {
            if (event.target !== event.currentTarget) return;
            if (window.matchMedia("(min-width: 640px)").matches) {
              onClose();
            }
          }}
        >
          <motion.div
            className="w-full max-w-xs overflow-hidden rounded-2xl border border-vanilla-200 bg-vanilla-50 shadow-2xl"
            style={{ minHeight: "420px" }}
            initial={{ scale: 0.97, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.97, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {step === "city" ? (
                <motion.div
                  key="city"
                  variants={slideVariants}
                  initial={direction < 0 ? "enterFromLeft" : "enterFromRight"}
                  animate="center"
                  exit={direction < 0 ? "exitToRight" : "exitToLeft"}
                  transition={{ type: "tween", duration: 0.22, ease: "easeInOut" }}
                >
                  <div className="border-b border-vanilla-200 px-4 py-4">
                    <p className="text-[11px] uppercase tracking-wider text-vanilla-500">
                      Ваш город
                    </p>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <h2 className="text-base font-semibold text-vanilla-900">Выберите город</h2>
                      <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer rounded-md px-2 py-1 text-xs font-medium text-vanilla-500 transition hover:bg-vanilla-100 hover:text-vanilla-800 sm:hidden"
                      >
                        Закрыть
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 px-2 py-3">
                    {citiesLoading ? (
                      <div className="px-2 py-3 text-sm text-vanilla-500">Загрузка…</div>
                    ) : citiesError ? (
                      <div className="px-2 py-3 text-sm text-red-600">{citiesError}</div>
                    ) : cities && cities.length > 0 ? (
                      cities.map((city) => (
                        <button
                          key={city.id}
                          type="button"
                          onClick={() => onSelectCity(city)}
                          className="box-border flex min-h-[44px] w-full cursor-pointer items-center justify-between gap-2 rounded-xl border border-vanilla-200 bg-white px-4 py-2.5 text-left text-sm shadow-sm transition hover:border-vanilla-300 hover:bg-vanilla-100"
                        >
                          <span className="min-w-0 flex-1 font-medium text-vanilla-900">{city.name}</span>
                          <span className="shrink-0 text-vanilla-400">→</span>
                        </button>
                      ))
                    ) : (
                      <div className="px-2 py-3 text-sm text-vanilla-500">Города не найдены.</div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="venue"
                  variants={slideVariants}
                  initial={direction > 0 ? "enterFromRight" : "enterFromLeft"}
                  animate="center"
                  exit={direction > 0 ? "exitToLeft" : "exitToRight"}
                  transition={{ type: "tween", duration: 0.22, ease: "easeInOut" }}
                >
                  <div className="border-b border-vanilla-200 px-4 py-4">
                    <button
                      type="button"
                      onClick={canGoBackToCity ? onBack : undefined}
                      disabled={!canGoBackToCity}
                      className="mb-2 flex cursor-pointer items-center gap-1 text-[11px] uppercase tracking-wider text-vanilla-500 transition hover:text-vanilla-800 disabled:cursor-not-allowed disabled:text-vanilla-300"
                    >
                      <span>←</span>
                      <span>{selectedCity?.name ?? "Назад"}</span>
                    </button>
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-base font-semibold text-vanilla-900">Выберите заведение</h2>
                      <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer rounded-md px-2 py-1 text-xs font-medium text-vanilla-500 transition hover:bg-vanilla-100 hover:text-vanilla-800 sm:hidden"
                      >
                        Закрыть
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 px-2 py-3">
                    {venuesLoading ? (
                      <div className="px-2 py-3 text-sm text-vanilla-500">Загрузка…</div>
                    ) : venuesError ? (
                      <div className="px-2 py-3 text-sm text-red-600">{venuesError}</div>
                    ) : venues && venues.length > 0 ? (
                      venues.map((venue) => (
                        <button
                          key={venue.id}
                          type="button"
                          onClick={() => onSelectVenue(venue)}
                          className="box-border flex min-h-[44px] w-full cursor-pointer items-center justify-between gap-2 rounded-xl border border-vanilla-200 bg-white px-4 py-2.5 text-left shadow-sm transition hover:border-vanilla-300 hover:bg-vanilla-100"
                        >
                          <div>
                            <div className="text-sm font-medium text-vanilla-900">{venue.name}</div>
                            <div className="text-xs text-vanilla-500">{venue.address}</div>
                          </div>
                          <span className="shrink-0 text-vanilla-400">→</span>
                        </button>
                      ))
                    ) : (
                      <div className="px-2 py-3 text-sm text-vanilla-500">
                        Заведения не найдены.
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
