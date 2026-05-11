"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";

import { QuantitySelector } from "@/components/product/QuantitySelector";
import { useCart } from "@/hooks/useCart";
import { useVenue } from "@/hooks/useVenue";
import { formatPriceFromKopecks } from "@/lib/utils";
import type { CartLineProduct } from "@/types/cart";
import type { ProductDetail } from "@/types/product";

const PLACEHOLDER = "/images/placeholder/product-placeholder.svg";

/** Пропсы клиентской части страницы товара */
export interface ProductPageClientProps {
  /** Данные товара, загруженные на сервере */
  product: ProductDetail;
}

/**
 * Детальная карточка товара: медиа, описание, количество, пожелание и добавление в корзину.
 */
export function ProductPageClient({ product }: ProductPageClientProps) {
  const { selectedVenue, selectedCity, openVenuePicker } = useVenue();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [wishes, setWishes] = useState("");
  const [addedFlash, setAddedFlash] = useState(false);

  const venueOk = selectedVenue?.id === product.venueId;
  const canOrder = venueOk && !product.isStopList;

  const handleAdd = useCallback(() => {
    if (!canOrder || quantity < 1) return;
    const line: CartLineProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      imageUrl: product.imageUrl,
      weight: product.weight,
      price: product.price,
      venueId: product.venueId,
    };
    addItem(line, quantity, wishes);
    setAddedFlash(true);
    window.setTimeout(() => setAddedFlash(false), 2200);
  }, [addItem, canOrder, product, quantity, wishes]);

  const handleClear = useCallback(() => {
    setQuantity(1);
    setWishes("");
  }, []);

  return (
    <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-14">
      <div className="relative w-full overflow-hidden rounded-3xl border border-vanilla-200 bg-vanilla-100 lg:max-w-lg lg:shrink-0">
        <div className="relative aspect-4/3 w-full lg:aspect-square">
          <Image
            src={product.imageUrl || PLACEHOLDER}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 512px"
            priority
          />
        </div>
        {product.isStopList ? (
          <p className="border-t border-vanilla-200 bg-vanilla-900/90 px-4 py-2 text-center text-xs font-semibold uppercase tracking-wide text-vanilla-50">
            В стоп-листе — временно нельзя заказать
          </p>
        ) : null}
      </div>

      <div className="min-w-0 flex-1 space-y-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-vanilla-500">
            {product.venue.name} · {product.category.name}
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold leading-tight text-vanilla-900 sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-3 text-2xl font-semibold text-vanilla-800">
            {formatPriceFromKopecks(product.price)}
          </p>
        </div>

        {product.description ? (
          <p className="text-sm leading-relaxed text-vanilla-700">{product.description}</p>
        ) : null}

        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          {product.weight ? (
            <div className="rounded-xl border border-vanilla-200 bg-vanilla-100/60 px-4 py-3">
              <dt className="text-xs font-medium uppercase tracking-wide text-vanilla-500">
                Граммовка / объём
              </dt>
              <dd className="mt-1 font-medium text-vanilla-900">{product.weight}</dd>
            </div>
          ) : null}
          {product.composition ? (
            <div className="rounded-xl border border-vanilla-200 bg-vanilla-100/60 px-4 py-3 sm:col-span-2">
              <dt className="text-xs font-medium uppercase tracking-wide text-vanilla-500">Состав</dt>
              <dd className="mt-1 text-vanilla-800">{product.composition}</dd>
            </div>
          ) : null}
        </dl>

        {!venueOk ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            Это блюдо из заведения «{product.venue.name}». Выберите его в шапке сайта, чтобы добавить
            в корзину.
            <button
              type="button"
              onClick={() => openVenuePicker(selectedCity ? "venue" : "city")}
              className="mt-3 block w-full rounded-xl bg-vanilla-800 px-4 py-2 text-center text-sm font-semibold text-vanilla-50 hover:bg-vanilla-700 sm:w-auto"
            >
              Выбрать заведение
            </button>
          </div>
        ) : null}

        <section className="space-y-3" aria-labelledby="qty-label">
          <h2 id="qty-label" className="text-sm font-semibold text-vanilla-900">
            Количество
          </h2>
          <QuantitySelector
            value={quantity}
            min={1}
            max={99}
            onChange={setQuantity}
            onClear={handleClear}
          />
        </section>

        <section className="space-y-2">
          <label htmlFor="wishes" className="text-sm font-semibold text-vanilla-900">
            Пожелания к блюду
          </label>
          <textarea
            id="wishes"
            value={wishes}
            onChange={(e) => setWishes(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Например: без лука, острый соус отдельно"
            className="w-full rounded-xl border border-vanilla-300 bg-white px-3 py-2 text-sm text-vanilla-900 shadow-sm outline-none transition placeholder:text-vanilla-400 focus:border-vanilla-500 focus:ring-2 focus:ring-vanilla-300/40"
          />
          <p className="text-xs text-vanilla-500">{wishes.length}/500</p>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            disabled={!canOrder}
            onClick={handleAdd}
            className="rounded-xl bg-vanilla-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition enabled:hover:bg-vanilla-400 disabled:cursor-not-allowed disabled:bg-vanilla-300 disabled:text-vanilla-100"
          >
            Добавить в корзину
          </button>
          <Link
            href={`/menu?category=${encodeURIComponent(product.category.slug)}`}
            className="text-center text-sm font-medium text-vanilla-600 underline-offset-4 hover:text-vanilla-800 hover:underline sm:text-left"
          >
            Вернуться в раздел «{product.category.name}»
          </Link>
        </div>

        {addedFlash ? (
          <p className="text-sm font-medium text-vanilla-700" role="status">
            Добавлено в корзину ({quantity} шт.)
          </p>
        ) : null}
      </div>
    </div>
  );
}
