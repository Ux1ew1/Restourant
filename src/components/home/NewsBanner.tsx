"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import type { HomeNewsItem } from "@/types/home";

const AUTOPLAY_MS = 6000;

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
 * Высота карточки фиксирована по сетке; смена слайда — кроссфейд и лёгкий сдвиг по вертикали
 * внутри `overflow-hidden`, чтобы внешний блок не прыгал.
 * Автопрокрутка сбрасывается после ручного «Назад» / «Далее», чтобы снова отсчитывались полные
 * `AUTOPLAY_MS` миллисекунд.
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
  /** Увеличивается при ручном листании — перезапускает интервал автопрокрутки */
  const [autoplayResetKey, setAutoplayResetKey] = useState(0);

  const itemsKey = items.map((i) => i.id).join(",");

  useEffect(() => {
    setIndex(0);
    setAutoplayResetKey((k) => k + 1);
  }, [itemsKey]);

  const advance = useCallback((dir: -1 | 1) => {
    setIndex((i) => {
      if (!items.length) return i;
      return (i + dir + items.length) % items.length;
    });
  }, [items.length]);

  const goManual = useCallback(
    (dir: -1 | 1) => {
      advance(dir);
      setAutoplayResetKey((k) => k + 1);
    },
    [advance],
  );

  useEffect(() => {
    if (items.length < 2) return;
    const id = window.setInterval(() => {
      advance(1);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [advance, items.length, autoplayResetKey]);

  if (loading && !items.length) {
    return (
      <div
        className="h-56 animate-pulse rounded-3xl bg-vanilla-200/80 sm:h-[300px]"
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
        <div className="grid grid-cols-1 sm:min-h-[300px] sm:grid-cols-[1.1fr_0.9fr]">
          {/* Фиксированная высота блока изображения */}
          <div className="relative h-[200px] w-full overflow-hidden sm:h-[300px] sm:min-h-0">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active.id}
                className="absolute inset-0"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                {active.imageUrl ? (
                  <Image
                    src={active.imageUrl}
                    alt={active.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 50vw"
                    priority={index === 0}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-vanilla-500">
                    No Image
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-vanilla-900/55 via-transparent to-transparent sm:bg-linear-to-r" />
          </div>

          <div className="flex h-[240px] flex-col border-t border-vanilla-200/80 bg-vanilla-50/70 sm:h-[300px] sm:border-t-0">
            <div className="relative flex-1 overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={active.id}
                  className="absolute inset-0 flex flex-col overflow-hidden px-6 pt-6 sm:px-4 sm:pr-10 sm:pt-8"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  <p className="shrink-0 text-xs font-medium uppercase tracking-widest text-vanilla-500">
                    Акции и новости
                  </p>
                  <h2 className="mt-2 line-clamp-2 shrink-0 font-serif text-2xl font-semibold leading-snug text-vanilla-900 sm:line-clamp-none sm:text-balance sm:text-3xl">
                    {active.title}
                  </h2>
                  <p className="mt-3 shrink-0 text-sm leading-relaxed text-vanilla-600 line-clamp-3">
                    {active.content?.trim() ? active.content : "\u00a0"}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {items.length > 1 ? (
              <div className="flex shrink-0 items-center gap-3 border-t border-vanilla-200/60 px-6 py-4 sm:border-t-0 sm:px-4 sm:pb-8 sm:pr-10">
                <button
                  type="button"
                  onClick={() => goManual(-1)}
                  className="rounded-full border border-vanilla-300 px-3 py-1.5 text-xs font-medium text-vanilla-800 transition-colors hover:border-vanilla-500 hover:bg-white"
                  aria-label="Предыдущий слайд"
                >
                  Назад
                </button>
                <button
                  type="button"
                  onClick={() => goManual(1)}
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
