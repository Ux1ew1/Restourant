"use client";

import { motion } from "framer-motion";
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

export interface ProductPageClientProps {
  product: ProductDetail;
}

export function ProductPageClient({ product }: ProductPageClientProps) {
  const { selectedVenue, selectedCity, openVenuePicker } = useVenue();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [wishes, setWishes] = useState("");
  const [addedFlash, setAddedFlash] = useState(false);

  const venueOk = selectedVenue?.id === product.venueId;
  const canOrder = venueOk && !product.isStopList;
  const totalPrice = product.price * quantity;

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
    <div className="mx-auto max-w-7xl">
      <section className="grid overflow-hidden rounded-[32px] bg-[#1a1a1a] shadow-[0_26px_70px_rgba(26,26,26,0.18)] lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative min-h-[360px] bg-[#2f3a2f] lg:min-h-[680px]">
          <Image
            src={product.imageUrl || PLACEHOLDER}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 58vw"
            priority
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(26,26,26,0.05)_0%,rgba(26,26,26,0.3)_100%)]" />
          <div className="absolute left-5 top-5 flex flex-wrap gap-2">
            <span className="rounded-full border border-[#c8a97e]/45 bg-[#1a1a1a]/55 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#c8a97e] backdrop-blur">
              {product.category.name}
            </span>
            {product.isStopList ? (
              <span className="rounded-full bg-[#5a2e2e] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#f6f1ea]">
                Стоп-лист
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col justify-between gap-8 p-6 text-[#f6f1ea] sm:p-9 lg:p-12">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#c8a97e]">
              {product.venue.name}
            </p>
            <h1 className="mt-4 font-serif text-5xl font-semibold leading-[1] sm:text-6xl">
              {product.name}
            </h1>
            <p className="mt-6 text-3xl font-semibold text-[#c8a97e]">
              {formatPriceFromKopecks(product.price)}
            </p>

            {product.description ? (
              <p className="mt-6 max-w-xl text-base leading-8 text-[#f6f1ea]/72">
                {product.description}
              </p>
            ) : (
              <p className="mt-6 max-w-xl text-base leading-8 text-[#f6f1ea]/62">
                Блюдо из меню ресторана с аккуратной подачей и свежими ингредиентами.
              </p>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {product.weight ? (
              <InfoTile label="Граммовка / объем" value={product.weight} />
            ) : null}
            <InfoTile label="Раздел меню" value={product.category.name} />
            {product.composition ? (
              <div className="rounded-[22px] border border-[#c8a97e]/22 bg-white/7 px-5 py-4 backdrop-blur sm:col-span-2">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#c8a97e]">Состав</p>
                <p className="mt-2 text-sm leading-7 text-[#f6f1ea]/78">{product.composition}</p>
              </div>
            ) : null}
          </div>

          {!venueOk ? (
            <div className="rounded-[22px] border border-[#c8a97e]/35 bg-[#c8a97e]/12 px-5 py-4 text-sm leading-6 text-[#f6f1ea]/82">
              Это блюдо из заведения «{product.venue.name}». Выберите его в шапке сайта, чтобы добавить в корзину.
              <button
                type="button"
                onClick={() => openVenuePicker(selectedCity ? "venue" : "city")}
                className="mt-4 block w-full cursor-pointer rounded-xl bg-[#c8a97e] px-4 py-3 text-center text-sm font-bold uppercase tracking-wide text-[#1a1a1a] hover:bg-[#e0bf8d] sm:w-auto"
              >
                Выбрать заведение
              </button>
            </div>
          ) : null}
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-8 max-w-5xl rounded-[28px] border border-[#c8a97e]/25 bg-white/88 p-5 shadow-[0_22px_60px_rgba(26,26,26,0.12)] backdrop-blur sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="space-y-3">
            <h2 className="font-serif text-3xl font-semibold text-[#2f3a2f]">Добавить к заказу</h2>
            <p className="text-sm leading-6 text-[#1a1a1a]/62">
              Укажите количество и пожелания к приготовлению.
            </p>
            <div className="pt-2">
              <QuantitySelector
                value={quantity}
                min={1}
                max={99}
                onChange={setQuantity}
                onClear={handleClear}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="wishes" className="text-sm font-semibold text-[#1a1a1a]">
                Пожелания к блюду
              </label>
              <textarea
                id="wishes"
                value={wishes}
                onChange={(e) => setWishes(e.target.value)}
                rows={4}
                maxLength={500}
                placeholder="Например: без лука, острый соус отдельно"
                className="mt-2 w-full rounded-[18px] border border-[#c8a97e]/35 bg-[#f6f1ea] px-4 py-3 text-sm text-[#1a1a1a] shadow-sm outline-none transition placeholder:text-[#1a1a1a]/38 focus:border-[#c8a97e] focus:ring-2 focus:ring-[#c8a97e]/25"
              />
              <p className="mt-1 text-xs text-[#1a1a1a]/45">{wishes.length}/500</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <motion.button
                type="button"
                disabled={!canOrder}
                onClick={handleAdd}
                whileTap={canOrder ? { scale: 0.97 } : undefined}
                animate={addedFlash ? { scale: [1, 1.04, 1] } : { scale: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={`rounded-xl px-7 py-3.5 text-sm font-bold uppercase tracking-wide shadow-sm transition ${
                  addedFlash
                    ? "bg-emerald-600 text-white enabled:hover:bg-emerald-500"
                    : "bg-[#c8a97e] text-[#1a1a1a] enabled:hover:bg-[#e0bf8d]"
                } disabled:cursor-not-allowed disabled:bg-vanilla-300 disabled:text-vanilla-100`}
              >
                {addedFlash ? "Добавлено" : `В корзину - ${formatPriceFromKopecks(totalPrice)}`}
              </motion.button>
              <Link
                href={`/menu?category=${encodeURIComponent(product.category.slug)}`}
                className="text-center text-sm font-semibold text-[#5a2e2e] underline-offset-4 hover:text-[#2f3a2f] hover:underline sm:text-left"
              >
                Вернуться в раздел «{product.category.name}»
              </Link>
            </div>

            {addedFlash ? (
              <p className="text-sm font-semibold text-[#2f3a2f]" role="status">
                Добавлено в корзину ({quantity} шт.)
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-[#c8a97e]/22 bg-white/7 px-5 py-4 backdrop-blur">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#c8a97e]">{label}</p>
      <p className="mt-2 text-sm font-semibold text-[#f6f1ea]">{value}</p>
    </div>
  );
}
