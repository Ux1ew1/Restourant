"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

import type { Venue } from "@/store/venueStore";

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

/**
 * Слайд-экран выбора заведения.
 *
 * Открывается после выбора города. Загружает заведения из `GET /api/venues?cityId=`.
 */
export function VenueModal({
  open,
  cityId,
  cityName,
  onBack,
  onSelectVenue,
}: {
  open: boolean;
  cityId: string;
  cityName: string;
  onBack: () => void;
  onSelectVenue: (venue: Venue) => void;
}) {
  const [venues, setVenues] = useState<Venue[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !cityId) return;

    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setVenues(null);

    fetch(`/api/venues?cityId=${encodeURIComponent(cityId)}`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error("HTTP");
        return r.json() as Promise<VenuesResponse>;
      })
      .then((data) => {
        if (controller.signal.aborted) return;
        if (!data.ok || !Array.isArray(data.venues)) {
          setError("Не удалось загрузить заведения");
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
        setError("Не удалось загрузить заведения");
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        setLoading(false);
      });

    return () => controller.abort();
  }, [open, cityId]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-modal="true"
          role="dialog"
        >
          <motion.div
            className="absolute inset-y-0 right-0 w-full max-w-xl border-l border-vanilla-200 bg-vanilla-50 shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          >
            <div className="px-6 pb-4 pt-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-vanilla-500">
                    {cityName}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-vanilla-900">
                    Выберите заведение
                  </h2>
                  <p className="mt-2 text-sm text-vanilla-700">
                    Адрес и ассортимент могут отличаться — выберите удобную точку.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onBack}
                  className="shrink-0 cursor-pointer rounded-full border border-vanilla-200 bg-white px-4 py-2 text-sm font-medium text-vanilla-800 hover:bg-vanilla-100"
                >
                  ← Назад
                </button>
              </div>
            </div>

            <div className="px-6 pb-8">
              {loading ? (
                <div className="rounded-2xl border border-vanilla-200 bg-white px-4 py-5 text-sm text-vanilla-700">
                  Загружаем заведения…
                </div>
              ) : error ? (
                <div className="rounded-2xl border border-vanilla-200 bg-white px-4 py-5 text-sm text-red-700">
                  {error}
                </div>
              ) : venues && venues.length > 0 ? (
                <div className="space-y-3">
                  {venues.map((venue) => (
                    <button
                      key={venue.id}
                      type="button"
                      onClick={() => onSelectVenue(venue)}
                      className="group flex w-full cursor-pointer items-center justify-between gap-5 rounded-3xl border border-vanilla-200 bg-white px-5 py-4 text-left transition hover:border-vanilla-300 hover:bg-vanilla-100"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative h-12 w-12 overflow-hidden rounded-2xl border border-vanilla-200 bg-vanilla-100">
                          <Image
                            src={venue.logoUrl || "/images/placeholder/venue-placeholder.svg"}
                            alt={venue.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                        <div>
                          <div className="text-base font-medium text-vanilla-900">
                            {venue.name}
                          </div>
                          <div className="mt-1 text-sm text-vanilla-700">{venue.address}</div>
                          {venue.phone ? (
                            <div className="mt-1 text-xs text-vanilla-500">{venue.phone}</div>
                          ) : null}
                        </div>
                      </div>

                      <div className="text-vanilla-400 transition group-hover:translate-x-0.5 group-hover:text-vanilla-700">
                        →
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-vanilla-200 bg-white px-4 py-5 text-sm text-vanilla-700">
                  Заведения не найдены.
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
