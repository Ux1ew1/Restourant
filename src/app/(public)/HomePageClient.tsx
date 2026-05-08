"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

import { CategoryNav } from "@/components/home/CategoryNav";
import { HomeMetadataEffect } from "@/components/home/HomeMetadataEffect";
import { NewsBanner } from "@/components/home/NewsBanner";
import { PopularProducts } from "@/components/home/PopularProducts";
import { useVenue } from "@/hooks/useVenue";
import type { HomeCategory, HomeNewsItem, HomePopularProduct } from "@/types/home";

type HomeBlockError = {
  news?: string;
  popular?: string;
  categories?: string;
};

/**
 * Клиентская главная страница: hero, данные по выбранному заведению и блоки этапа 5.
 *
 * Загружает новости, популярные позиции и категории при появлении `selectedVenue.id`.
 * При смене заведения запросы отменяются через `AbortController`, чтобы не было гонок.
 */
export function HomePageClient() {
  const { selectedCity, selectedVenue, openVenuePicker } = useVenue();

  const [news, setNews] = useState<HomeNewsItem[]>([]);
  const [popular, setPopular] = useState<HomePopularProduct[]>([]);
  const [categories, setCategories] = useState<HomeCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<HomeBlockError>({});

  useEffect(() => {
    const venueId = selectedVenue?.id;
    if (!venueId) {
      setNews([]);
      setPopular([]);
      setCategories([]);
      setErrors({});
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setErrors({});

    void (async () => {
      setNews([]);
      setPopular([]);
      setCategories([]);

      const base = (path: string) =>
        fetch(path, { signal: controller.signal, cache: "no-store" });

      try {
        const settled = await Promise.allSettled([
          base(`/api/news?venueId=${encodeURIComponent(venueId)}`).then(async (res) => {
            const body = (await res.json()) as { ok?: boolean; news?: HomeNewsItem[] };
            if (!res.ok || !body.ok || !body.news) throw new Error("news");
            return body.news;
          }),
          base(`/api/products/popular?venueId=${encodeURIComponent(venueId)}`).then(
            async (res) => {
              const body = (await res.json()) as { ok?: boolean; products?: HomePopularProduct[] };
              if (!res.ok || !body.ok || !body.products) throw new Error("popular");
              return body.products;
            },
          ),
          base(`/api/categories?venueId=${encodeURIComponent(venueId)}`).then(async (res) => {
            const body = (await res.json()) as { ok?: boolean; categories?: HomeCategory[] };
            if (!res.ok || !body.ok || !body.categories) throw new Error("categories");
            return body.categories;
          }),
        ]);

        const nextErrors: HomeBlockError = {};

        if (settled[0]?.status === "fulfilled") setNews(settled[0].value);
        else nextErrors.news = "Не удалось загрузить новости";

        if (settled[1]?.status === "fulfilled") setPopular(settled[1].value);
        else nextErrors.popular = "Не удалось загрузить популярные позиции";

        if (settled[2]?.status === "fulfilled") setCategories(settled[2].value);
        else nextErrors.categories = "Не удалось загрузить категории";

        setErrors(nextErrors);
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setErrors({
          news: "Ошибка сети",
          popular: "Ошибка сети",
          categories: "Ошибка сети",
        });
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [selectedVenue?.id]);

  const hasVenue = Boolean(selectedVenue);

  return (
    <>
      <HomeMetadataEffect city={selectedCity} venue={selectedVenue} />

      <div className="space-y-12">
        <section className="relative overflow-hidden rounded-3xl bg-vanilla-900 px-8 py-20 text-center sm:py-28">
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% 0%, #5C4427 0%, transparent 70%)",
            }}
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              background:
                "radial-gradient(ellipse 60% 50% at 50% 100%, #C4A882 0%, transparent 70%)",
            }}
          />

          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            {selectedCity ? (
              <p className="text-xs font-medium uppercase tracking-widest text-vanilla-400">
                {selectedCity.name}
              </p>
            ) : null}

            <h1 className="mt-4 whitespace-pre-line font-serif text-4xl font-semibold leading-tight text-vanilla-50 sm:text-5xl">
              {selectedVenue ? selectedVenue.name : "Вкусная еда\nрядом с вами"}
            </h1>

            {selectedVenue ? (
              <p className="mt-3 text-sm text-vanilla-400">{selectedVenue.address}</p>
            ) : (
              <p className="mt-3 text-sm text-vanilla-400">
                Выберите заведение, чтобы увидеть меню и акции
              </p>
            )}

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/menu"
                className="rounded-xl bg-vanilla-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors duration-150 hover:bg-vanilla-400"
              >
                Смотреть меню
              </Link>
              <button
                type="button"
                onClick={() => openVenuePicker(selectedCity ? "venue" : "city")}
                className="rounded-xl border border-vanilla-700 px-6 py-3 text-sm font-medium text-vanilla-300 transition-colors duration-150 hover:border-vanilla-500 hover:text-vanilla-100"
              >
                {selectedVenue ? "Сменить заведение" : "Выбрать заведение"}
              </button>
            </div>
          </motion.div>
        </section>

        {hasVenue ? (
          <div className="space-y-12">
            <NewsBanner items={news} loading={loading} error={errors.news} />
            <PopularProducts
              products={popular}
              loading={loading}
              error={errors.popular}
            />
            <CategoryNav
              categories={categories}
              loading={loading}
              error={errors.categories}
            />
          </div>
        ) : (
          <p className="text-center text-sm text-vanilla-500">
            После выбора заведения здесь появятся акции, популярные блюда и быстрые ссылки на
            разделы меню.
          </p>
        )}
      </div>
    </>
  );
}
