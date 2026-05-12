"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
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

export function HomePageClient() {
  const { selectedCity, selectedVenue, openVenuePicker } = useVenue();
  const { data: session } = useSession();

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

      const base = (path: string) => fetch(path, { signal: controller.signal });

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
  const storyTitle = selectedVenue?.storyTitle || "Итальянские традиции в каждом блюде";
  const storyText =
    selectedVenue?.storyText ||
    "Мы вдохновлены уютными семейными ресторанами северной Италии и европейскими кулинарными традициями. Каждое блюдо - это сочетание качества, вкуса и любви к своему делу.";

  return (
    <>
      <HomeMetadataEffect city={selectedCity} venue={selectedVenue} />

      <div className="bg-[#f6f1ea] text-[#1a1a1a]">
        <section className="relative -mt-[65px] min-h-[calc(100svh+65px)] overflow-hidden bg-[#1a1a1a] pt-[65px] text-[#f6f1ea]">
          <Image
            src="/images/hero/italian-restaurant-hero.png"
            alt=""
            fill
            priority
            className="object-cover opacity-55"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(26,26,26,0.94)_0%,rgba(26,26,26,0.74)_42%,rgba(26,26,26,0.26)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#1a1a1a] to-transparent" />

          <motion.div
            className="relative mx-auto flex min-h-[calc(100svh-65px)] max-w-7xl items-center px-4 py-16 sm:px-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#c8a97e]">
                {selectedCity?.name || "Добро пожаловать"}
              </p>
              <h1 className="mt-5 font-serif text-5xl font-semibold leading-[0.98] text-[#f6f1ea] sm:text-7xl lg:text-8xl">
                Настоящий вкус Италии и Европы
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-[#f6f1ea]/82 sm:text-lg">
                Домашняя паста, свежие ингредиенты и атмосфера гостеприимства в заведении{" "}
                {selectedVenue ? selectedVenue.name : "рядом с вами"}.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link
                  href="/menu"
                  className="rounded-xl bg-[#c8a97e] px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-[#1a1a1a] shadow-[0_16px_36px_rgba(200,169,126,0.3)] transition hover:bg-[#e0bf8d] hover:shadow-[0_20px_48px_rgba(200,169,126,0.38)]"
                >
                  Смотреть меню
                </Link>
                <button
                  type="button"
                  onClick={() => openVenuePicker(selectedCity ? "venue" : "city")}
                  className="cursor-pointer rounded-xl border border-[#c8a97e]/55 px-7 py-3.5 text-sm font-semibold text-[#f6f1ea] transition hover:border-[#c8a97e] hover:bg-white/10"
                >
                  {selectedVenue ? "Сменить заведение" : "Выбрать заведение"}
                </button>
                {session?.user?.role === "ADMIN" ? (
                  <Link href="/admin" className="rounded-xl border border-white/25 px-7 py-3.5 text-sm font-semibold text-[#f6f1ea] transition hover:bg-white/10">
                    Админ-панель
                  </Link>
                ) : null}
              </div>

              {selectedVenue ? (
                <p className="mt-6 text-sm text-[#f6f1ea]/65">{selectedVenue.address}</p>
              ) : null}
            </div>
          </motion.div>
        </section>

        <section className="border-b border-[#c8a97e]/25 bg-[#f6f1ea]">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
            {[
              ["Свежие продукты", "Ингредиенты, которые раскрывают вкус блюда."],
              ["Авторская кухня", "Европейская база и мягкий итальянский акцент."],
              ["Уютная атмосфера", "Теплый зал для встреч, ужинов и семейных вечеров."],
              ["Винная карта", "Подборки к пасте, мясу, рыбе и десертам."],
            ].map(([title, text]) => (
              <div key={title} className="border-[#c8a97e]/25 lg:border-r lg:pr-6 last:border-r-0">
                <p className="font-serif text-xl font-semibold text-[#2f3a2f]">{title}</p>
                <p className="mt-2 text-sm leading-6 text-[#1a1a1a]/65">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {hasVenue ? (
          <div className="space-y-16 py-14">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
              <NewsBanner items={news} loading={loading} error={errors.news} />
            </div>
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
              <PopularProducts products={popular} loading={loading} error={errors.popular} />
            </div>

            {selectedVenue?.storyEnabled ? (
              <section id="restaurant-story" className="bg-white/55">
                <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
                  <div className="relative min-h-[320px] overflow-hidden rounded-[28px] shadow-[0_22px_55px_rgba(26,26,26,0.16)]">
                    <Image
                      src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1400&q=82"
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                  <div className="relative overflow-hidden rounded-[28px] bg-[#f6f1ea] px-6 py-10 sm:px-10">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#c8a97e]">О ресторане</p>
                    <h2 className="mt-4 max-w-xl font-serif text-4xl font-semibold leading-tight text-[#2f3a2f] sm:text-5xl">
                      {storyTitle}
                    </h2>
                    <p className="mt-5 max-w-2xl text-base leading-8 text-[#1a1a1a]/70">{storyText}</p>
                    <Link href="/menu" className="mt-7 inline-flex rounded-xl bg-[#2f3a2f] px-6 py-3 text-sm font-semibold text-[#f6f1ea] transition hover:bg-[#243024]">
                      Узнать вкус ближе
                    </Link>
                  </div>
                </div>
              </section>
            ) : null}

            <section className="bg-[#2f3a2f] text-[#f6f1ea]">
              <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#c8a97e]">Винная карта</p>
                  <h2 className="mt-4 font-serif text-4xl font-semibold leading-tight sm:text-5xl">
                    Вина Италии и Европы для идеального сочетания
                  </h2>
                  <p className="mt-5 text-base leading-8 text-[#f6f1ea]/70">
                    Легкие белые к морепродуктам, насыщенные красные к пасте и деликатные игристые для вечера.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  {["Pinot Grigio", "Chianti Classico", "Prosecco Brut"].map((wine) => (
                    <div key={wine} className="rounded-[24px] border border-[#c8a97e]/30 bg-white/7 p-5 backdrop-blur">
                      <p className="font-serif text-2xl text-[#c8a97e]">{wine}</p>
                      <p className="mt-3 text-sm leading-6 text-[#f6f1ea]/65">Рекомендация сомелье к основным блюдам.</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {selectedVenue?.bookingEnabled ? (
              <section id="booking" className="mx-auto max-w-7xl px-4 sm:px-6">
                <div className="grid gap-6 rounded-[28px] bg-[#5a2e2e] px-6 py-8 text-[#f6f1ea] shadow-[0_20px_55px_rgba(90,46,46,0.22)] sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                  <div>
                    <h2 className="font-serif text-4xl font-semibold">Забронируйте столик</h2>
                    <p className="mt-3 text-sm leading-6 text-[#f6f1ea]/75">
                      Блок готов к подключению, когда бронирование станет доступно.
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-4">
                    {["Дата", "Время", "Гости"].map((label) => (
                      <div key={label} className="rounded-xl border border-[#c8a97e]/35 bg-white/8 px-4 py-3 text-sm text-[#f6f1ea]/80">
                        {label}
                      </div>
                    ))}
                    <button className="rounded-xl bg-[#c8a97e] px-4 py-3 text-sm font-bold uppercase tracking-wide text-[#1a1a1a]">
                      Забронировать
                    </button>
                  </div>
                </div>
              </section>
            ) : null}

            <div className="mx-auto max-w-7xl px-4 sm:px-6">
              <CategoryNav categories={categories} loading={loading} error={errors.categories} />
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-7xl px-4 py-16 text-center text-sm text-[#1a1a1a]/55 sm:px-6">
            После выбора заведения здесь появятся акции, популярные блюда и быстрые ссылки на разделы меню.
          </div>
        )}
      </div>
    </>
  );
}
