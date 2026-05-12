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
export function PopularProducts({ products, error, loading }: PopularProductsProps) {
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
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="font-serif text-xl font-semibold text-vanilla-900 sm:text-2xl">
          Популярное
        </h2>
        <Link
          href="/menu"
          className="text-sm font-medium text-vanilla-600 underline-offset-4 hover:text-vanilla-800 hover:underline"
        >
          Всё меню
        </Link>
      </div>

      <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 pt-1 [scrollbar-width:thin] sm:mx-0 sm:px-0">
        {products.map((p, i) => (
          <motion.article
            key={p.id}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.35, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
            className="w-[min(220px,78vw)] shrink-0"
          >
            <Link
              href={`/product/${p.id}`}
              className={`group block overflow-hidden rounded-2xl border border-vanilla-200 bg-white shadow-sm transition-shadow hover:shadow-md ${
                p.isStopList ? "opacity-90" : ""
              }`}
            >
              <div className="relative aspect-4/3 bg-vanilla-100">
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
              <div className="space-y-1 px-3 py-3">
                <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-vanilla-900">
                  {p.name}
                </h3>
                {p.weight ? (
                  <p className="text-xs text-vanilla-500">{p.weight}</p>
                ) : null}
                <p className="text-sm font-semibold text-vanilla-800">
                  {formatPriceFromKopecks(p.price)}
                </p>
              </div>
            </Link>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
