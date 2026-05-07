"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import type { City } from "@/store/venueStore";
import { useVenue } from "@/hooks/useVenue";

type CitiesResponse =
  | { ok: true; cities: Array<{ id: string; name: string; slug: string; isActive: boolean }> }
  | { ok: false; error: string };

/**
 * Модальное окно выбора города.
 *
 * Показывается при первом визите (если город/заведение не выбраны) и загружает список
 * городов из `GET /api/cities`.
 */
export function CityModal({
  open,
  onSelectCity,
}: {
  open: boolean;
  onSelectCity: (city: City) => void;
}) {
  const { selectedCity } = useVenue();
  const [cities, setCities] = useState<City[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Зависимость только от `open`: если добавить `loading` в deps, эффект перезапускается
   * сразу после setLoading(true), cleanup делает abort, новый проход видит loading===true
   * и выходит — fetch не доходит до finally с setLoading(false) → вечный спиннер.
   */
  useEffect(() => {
    if (!open) return;

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch("/api/cities", { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error("HTTP");
        return r.json() as Promise<CitiesResponse>;
      })
      .then((data) => {
        if (controller.signal.aborted) return;
        if (!data.ok || !Array.isArray(data.cities)) {
          setError("Не удалось загрузить города");
          return;
        }
        setCities(data.cities.map((c) => ({ id: c.id, name: c.name, slug: c.slug })));
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setError("Не удалось загрузить города");
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        setLoading(false);
      });

    return () => controller.abort();
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 py-6 backdrop-blur-sm sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-modal="true"
          role="dialog"
        >
          <motion.div
            className="w-full max-w-xl overflow-hidden rounded-3xl border border-vanilla-200 bg-vanilla-50 shadow-2xl"
            initial={{ y: 24, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 24, scale: 0.98, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
          >
            <div className="px-6 pb-4 pt-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-vanilla-500">
                    Ваш город
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-vanilla-900">
                    Выберите город
                  </h2>
                  <p className="mt-2 text-sm text-vanilla-700">
                    Это нужно, чтобы показать ближайшие заведения и актуальное меню.
                  </p>
                </div>
                {selectedCity ? (
                  <div className="mt-1 shrink-0 rounded-full border border-vanilla-200 bg-white px-3 py-1 text-sm text-vanilla-800">
                    Сейчас: {selectedCity.name}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="px-6 pb-6">
              {loading ? (
                <div className="rounded-2xl border border-vanilla-200 bg-white px-4 py-5 text-sm text-vanilla-700">
                  Загружаем список городов…
                </div>
              ) : error ? (
                <div className="rounded-2xl border border-vanilla-200 bg-white px-4 py-5 text-sm text-red-700">
                  {error}
                </div>
              ) : cities && cities.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {cities.map((city) => (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => onSelectCity(city)}
                      className="group rounded-2xl border border-vanilla-200 bg-white px-5 py-4 text-left transition hover:border-vanilla-300 hover:bg-vanilla-100"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="text-base font-medium text-vanilla-900">
                            {city.name}
                          </div>
                          <div className="mt-1 text-xs text-vanilla-500">{city.slug}</div>
                        </div>
                        <div className="text-vanilla-400 transition group-hover:translate-x-0.5 group-hover:text-vanilla-700">
                          →
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-vanilla-200 bg-white px-4 py-5 text-sm text-vanilla-700">
                  Города не найдены.
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

