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
      <p className="mb-3 hidden text-xs font-bold uppercase tracking-[0.22em] text-[#c8a97e] lg:block">
        Разделы
      </p>

      <div className="-mx-1 flex gap-2 overflow-x-auto pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:pb-0">
        <Link
          href={hrefFor(null)}
          className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition-all lg:rounded-xl lg:px-4 ${
            activeSlug === null
              ? "bg-[#c8a97e] text-[#1a1a1a] shadow-[0_10px_22px_rgba(200,169,126,0.2)]"
              : "bg-white/8 text-[#f6f1ea]/78 hover:bg-white/14 hover:text-[#f6f1ea]"
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
              className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition-all lg:rounded-xl lg:px-4 ${
                active
                  ? "bg-[#c8a97e] text-[#1a1a1a] shadow-[0_10px_22px_rgba(200,169,126,0.2)]"
                  : "bg-white/8 text-[#f6f1ea]/78 hover:bg-white/14 hover:text-[#f6f1ea]"
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
