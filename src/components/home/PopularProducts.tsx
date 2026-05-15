"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

import { formatPriceFromKopecks } from "@/lib/utils";
import type { HomePopularProduct } from "@/types/home";

/** Пропсы горизонтальной полосы популярных товаров */
interface PopularProductsProps {
  /** Список популярных позиций */
  products: HomePopularProduct[];
  /** Текст ошибки */
  error?: string | null;
  /** Загрузка */
  loading?: boolean;
  /** Базовый путь заведения, например `/central` */
  basePath?: string;
}

/**
 * Горизонтальная полоса «часто заказывают» на главной странице.
 *
 * Карточки ведут на страницу товара (`/product/[id]`). Позиции в стоп-листе отображаются
 * с пометкой и без призыва к заказу.
 *
 * @param products - Товары из API популярных позиций
 * @param error - Ошибка загрузки
 * @param loading - Скелетон при первой загрузке
 *
 * @example
 * <PopularProducts products={hits} loading={loading} error={err} />
 */
export function PopularProducts({ products, error, loading, basePath = "" }: PopularProductsProps) {
  const menuPath = `${basePath}/menu`;
  if (loading && !products.length) {
    return (
      <section aria-label="Популярные позиции">
        <div className="mb-4 h-6 w-40 animate-pulse rounded bg-vanilla-200" />
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3].map((k) => (
            <div
              key={k}
              className="h-48 w-40 shrink-0 animate-pulse rounded-2xl bg-vanilla-200/90"
            />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section aria-label="Популярные позиции">
        <h2 className="font-serif text-xl font-semibold text-vanilla-900">Популярное</h2>
        <p className="mt-3 text-sm text-vanilla-600">{error}</p>
      </section>
    );
  }

  if (!products.length) {
    return (
      <section aria-label="Популярные позиции">
        <h2 className="font-serif text-xl font-semibold text-vanilla-900">Популярное</h2>
        <p className="mt-3 text-sm text-vanilla-500">
          Для этого заведения пока не настроены популярные позиции
        </p>
      </section>
    );
  }

  return (
    <section aria-label="Популярные позиции">
      <div className="mb-7 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#c8a97e]">Популярное</p>
          <h2 className="mt-2 font-serif text-4xl font-semibold leading-tight text-[#1a1a1a] sm:text-5xl">
            Попробуйте наши блюда
          </h2>
        </div>
        <Link
          href={menuPath}
          className="hidden text-sm font-medium text-[#5a2e2e] underline-offset-4 hover:text-[#2f3a2f] hover:underline sm:inline"
        >
          Смотреть всё меню
        </Link>
      </div>

      <div className="-mx-4 flex gap-5 overflow-x-auto px-4 pb-4 pt-1 [scrollbar-width:thin] sm:mx-0 sm:px-0 lg:grid lg:grid-cols-4 lg:overflow-visible">
        {products.map((p, i) => (
          <motion.article
            key={p.id}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.35, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -6 }}
            className="w-[min(290px,82vw)] shrink-0 lg:w-auto"
          >
            <Link
              href={`/product/${p.id}`}
              className={`group block overflow-hidden rounded-[24px] border border-[#c8a97e]/20 bg-white shadow-[0_14px_34px_rgba(26,26,26,0.08)] transition-shadow hover:shadow-[0_24px_52px_rgba(26,26,26,0.14)] ${
                p.isStopList ? "opacity-90" : ""
              }`}
            >
              <div className="relative aspect-[1.25] bg-vanilla-100">
                {p.imageUrl ? (
                  <Image
                    src={p.imageUrl}
                    alt={p.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    sizes="220px"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-vanilla-500">
                    No Image
                  </div>
                )}
                {p.isStopList ? (
                  <span className="absolute left-2 top-2 rounded-md bg-vanilla-900/85 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-vanilla-50">
                    Стоп-лист
                  </span>
                ) : null}
              </div>
              <div className="space-y-3 px-5 py-5">
                <h3 className="line-clamp-2 text-base font-semibold leading-snug text-[#1a1a1a]">
                  {p.name}
                </h3>
                {p.weight ? (
                  <p className="text-sm leading-6 text-[#1a1a1a]/58">{p.weight}</p>
                ) : null}
                <div className="flex items-center justify-between gap-3 pt-2">
                  <p className="text-lg font-semibold text-[#1a1a1a]">
                    {formatPriceFromKopecks(p.price)}
                  </p>
                  <span className="rounded-full border border-[#c8a97e]/55 px-3 py-1.5 text-xs font-semibold text-[#5a2e2e] transition group-hover:bg-[#c8a97e] group-hover:text-[#1a1a1a]">
                    Заказать
                  </span>
                </div>
              </div>
            </Link>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
