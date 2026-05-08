"use client";

import Link from "next/link";

import type { HomeCategory } from "@/types/home";

/** Пропсы блока быстрых ссылок на категории меню */
interface CategoryNavProps {
  /** Активные категории заведения */
  categories: HomeCategory[];
  /** Ошибка загрузки */
  error?: string | null;
  /** Первая загрузка */
  loading?: boolean;
}

/**
 * Быстрые ссылки на разделы меню заведения.
 *
 * Ведёт на `/menu` с query-параметром `category` (slug) — страница меню на этапе 6
 * сможет подсветить/отфильтровать выбранный раздел.
 *
 * @param categories - Категории из API
 * @param error - Текст ошибки
 * @param loading - Показать плейсхолдеры загрузки
 *
 * @example
 * <CategoryNav categories={cats} loading={loading} error={err} />
 */
export function CategoryNav({ categories, error, loading }: CategoryNavProps) {
  if (loading && !categories.length) {
    return (
      <section aria-label="Категории меню">
        <div className="mb-3 h-6 w-48 animate-pulse rounded bg-vanilla-200" />
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((k) => (
            <div key={k} className="h-9 w-24 animate-pulse rounded-full bg-vanilla-200" />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section aria-label="Категории меню">
        <h2 className="font-serif text-xl font-semibold text-vanilla-900">Категории</h2>
        <p className="mt-2 text-sm text-vanilla-600">{error}</p>
      </section>
    );
  }

  if (!categories.length) {
    return (
      <section aria-label="Категории меню">
        <h2 className="font-serif text-xl font-semibold text-vanilla-900">Категории</h2>
        <p className="mt-2 text-sm text-vanilla-500">Категории меню появятся после настройки</p>
      </section>
    );
  }

  return (
    <section aria-label="Категории меню">
      <h2 className="mb-3 font-serif text-xl font-semibold text-vanilla-900 sm:text-2xl">
        Категории
      </h2>
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/menu?category=${encodeURIComponent(c.slug)}`}
            className="rounded-full border border-vanilla-300 bg-vanilla-50 px-4 py-2 text-sm font-medium text-vanilla-800 transition-colors hover:border-vanilla-500 hover:bg-white"
          >
            {c.name}
          </Link>
        ))}
        <Link
          href="/menu"
          className="rounded-full border border-dashed border-vanilla-400 px-4 py-2 text-sm font-medium text-vanilla-600 transition-colors hover:border-vanilla-500 hover:text-vanilla-900"
        >
          Всё меню
        </Link>
      </div>
    </section>
  );
}
