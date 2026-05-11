"use client";

import Link from "next/link";
import { useCallback } from "react";

import type { MenuCategory } from "@/types/menu";

/** Пропсы навигации по категориям меню */
export interface CategorySidebarProps {
  /** Активные категории заведения */
  categories: MenuCategory[];
  /** Slug выбранной категории или `null` для режима «все разделы» */
  activeSlug: string | null;
  /** Базовый путь для ссылок (обычно `/menu`) */
  basePath?: string;
}

/**
 * Навигация по категориям: на широких экранах — вертикальный список слева, на узких — горизонтальные вкладки.
 *
 * Синхронизируется с URL через query `?category=<slug>`; режим «Все разделы» — без параметра.
 *
 * @param categories - Категории из API
 * @param activeSlug - Текущий slug из `searchParams` или `null`
 * @param basePath - Префикс пути (по умолчанию `/menu`)
 *
 * @example
 * <CategorySidebar categories={cats} activeSlug={slug} />
 */
export function CategorySidebar({
  categories,
  activeSlug,
  basePath = "/menu",
}: CategorySidebarProps) {
  const hrefFor = useCallback(
    (slug: string | null) => {
      if (!slug) return basePath;
      const q = new URLSearchParams({ category: slug });
      return `${basePath}?${q.toString()}`;
    },
    [basePath],
  );

  if (!categories.length) {
    return null;
  }

  return (
    <nav aria-label="Категории меню" className="w-full">
      <p className="mb-2 hidden text-xs font-semibold uppercase tracking-wider text-vanilla-500 lg:block">
        Разделы
      </p>

      <div className="-mx-1 flex gap-1 overflow-x-auto pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:pb-0">
        <Link
          href={hrefFor(null)}
          className={`shrink-0 rounded-full px-3 py-2 text-sm font-medium transition-colors lg:rounded-xl lg:px-3 ${
            activeSlug === null
              ? "bg-vanilla-800 text-vanilla-50"
              : "bg-vanilla-100 text-vanilla-800 hover:bg-vanilla-200"
          }`}
        >
          Все разделы
        </Link>
        {categories.map((c) => {
          const active = activeSlug === c.slug;
          return (
            <Link
              key={c.id}
              href={hrefFor(c.slug)}
              scroll={false}
              className={`shrink-0 rounded-full px-3 py-2 text-sm font-medium transition-colors lg:rounded-xl lg:px-3 ${
                active
                  ? "bg-vanilla-800 text-vanilla-50"
                  : "bg-vanilla-100 text-vanilla-800 hover:bg-vanilla-200"
              }`}
            >
              {c.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
