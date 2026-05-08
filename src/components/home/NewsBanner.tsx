"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import type { HomeNewsItem } from "@/types/home";

const PLACEHOLDER = "/images/placeholder/product-placeholder.svg";

/** Пропсы слайдера новостных баннеров */
interface NewsBannerProps {
  /** Элементы для слайдера (порядок как от API) */
  items: HomeNewsItem[];
  /** Текст ошибки при неудачной загрузке */
  error?: string | null;
  /** Первичная загрузка данных */
  loading?: boolean;
}

/**
 * Слайдер баннеров новостей и акций на главной странице.
 *
 * Использует Framer Motion для смены слайдов; при двух и более элементах включается
 * автопрокрутка. Изображение опционально — при отсутствии `imageUrl` показывается заглушка.
 *
 * @param items - Массив баннеров
 * @param error - Сообщение об ошибке (показывается вместо слайдера)
 * @param loading - Показать скелетон до прихода данных
 *
 * @example
 * <NewsBanner items={news} loading={loading} error={err} />
 */
export function NewsBanner({ items, error, loading }: NewsBannerProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [items]);

  const go = useCallback(
    (dir: -1 | 1) => {
      if (!items.length) return;
      setIndex((i) => (i + dir + items.length) % items.length);
    },
    [items.length],
  );

  useEffect(() => {
    if (items.length < 2) return;
    const id = window.setInterval(() => go(1), 6000);
    return () => window.clearInterval(id);
  }, [go, items.length]);

  if (loading && !items.length) {
    return (
      <div
        className="h-56 animate-pulse rounded-3xl bg-vanilla-200/80 sm:h-64"
        aria-hidden
      />
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-vanilla-200 bg-vanilla-100 px-6 py-5 text-sm text-vanilla-700">
        {error}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-vanilla-300 bg-vanilla-100/60 px-6 py-8 text-center text-sm text-vanilla-500">
        Пока нет акций и новостей для этого заведения
      </div>
    );
  }

  const active = items[index]!;

  return (
    <section aria-roledescription="carousel" aria-label="Новости и акции" className="relative">
      <div className="overflow-hidden rounded-3xl border border-vanilla-200 bg-vanilla-100 shadow-sm">
        <div className="grid min-h-[220px] sm:min-h-[240px] sm:grid-cols-[1.1fr_0.9fr]">
          <div className="relative aspect-16/10 sm:aspect-auto sm:min-h-[240px]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active.id}
                className="absolute inset-0"
                initial={{ opacity: 0.001 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0.001 }}
                transition={{ duration: 0.35 }}
              >
                <Image
                  src={active.imageUrl || PLACEHOLDER}
                  alt={active.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 50vw"
                  priority={index === 0}
                />
              </motion.div>
            </AnimatePresence>
            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-vanilla-900/55 via-transparent to-transparent sm:bg-linear-to-r" />
          </div>

          <div className="flex flex-col justify-center px-6 py-6 sm:py-8 sm:pl-4 sm:pr-10">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="text-xs font-medium uppercase tracking-widest text-vanilla-500">
                  Акции и новости
                </p>
                <h2 className="mt-2 font-serif text-2xl font-semibold leading-tight text-vanilla-900 sm:text-3xl">
                  {active.title}
                </h2>
                {active.content ? (
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-vanilla-600">
                    {active.content}
                  </p>
                ) : null}
              </motion.div>
            </AnimatePresence>

            {items.length > 1 ? (
              <div className="mt-6 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => go(-1)}
                  className="rounded-full border border-vanilla-300 px-3 py-1.5 text-xs font-medium text-vanilla-800 transition-colors hover:border-vanilla-500 hover:bg-white"
                  aria-label="Предыдущий слайд"
                >
                  Назад
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  className="rounded-full border border-vanilla-300 px-3 py-1.5 text-xs font-medium text-vanilla-800 transition-colors hover:border-vanilla-500 hover:bg-white"
                  aria-label="Следующий слайд"
                >
                  Далее
                </button>
                <span className="ml-auto text-xs text-vanilla-400">
                  {index + 1} / {items.length}
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
