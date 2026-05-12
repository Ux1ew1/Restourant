"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";

import { CategorySidebar } from "@/components/menu/CategorySidebar";
import { ProductGrid } from "@/components/menu/ProductGrid";
import { useCart } from "@/hooks/useCart";
import { useVenue } from "@/hooks/useVenue";
import type { MenuCategory, MenuProduct } from "@/types/menu";

type CategoriesResponse = { ok: true; categories: MenuCategory[] } | { ok: false };
type ProductsResponse = { ok: true; products: MenuProduct[] } | { ok: false };

/**
 * Клиентская страница меню: загрузка категорий и товаров, фильтр по query `category`.
 */
export function MenuPageClient() {
  const { selectedVenue, selectedCity, openVenuePicker } = useVenue();
  const { items, addItem, removeItem, updateQuantity } = useCart();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [products, setProducts] = useState<MenuProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const venueId = selectedVenue?.id ?? null;
  const categoryParam = searchParams.get("category");

  const activeSlug = useMemo(() => {
    if (!categoryParam || !categories.length) return null;
    return categories.some((c) => c.slug === categoryParam) ? categoryParam : null;
  }, [categoryParam, categories]);

  useEffect(() => {
    if (!categoryParam || !categories.length) return;
    if (!categories.some((c) => c.slug === categoryParam)) {
      router.replace("/menu");
    }
  }, [categoryParam, categories, router]);

  useEffect(() => {
    if (!venueId) {
      setCategories([]);
      setProducts([]);
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch(`/api/categories?venueId=${encodeURIComponent(venueId)}`, {
            signal: controller.signal,
          }),
          fetch(`/api/products?venueId=${encodeURIComponent(venueId)}`, {
            signal: controller.signal,
          }),
        ]);

        const catJson = (await catRes.json()) as CategoriesResponse;
        const prodJson = (await prodRes.json()) as ProductsResponse;

        if (!catRes.ok || !catJson.ok) {
          throw new Error("categories");
        }
        if (!prodRes.ok || !prodJson.ok) {
          throw new Error("products");
        }

        setCategories(catJson.categories);
        setProducts(prodJson.products);
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setError("Не удалось загрузить меню. Попробуйте обновить страницу.");
        setCategories([]);
        setProducts([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [venueId]);

  const handleAdd = useCallback(
    (product: MenuProduct) => {
      if (product.isStopList || !selectedVenue) return;
      addItem(
        {
          id: product.id,
          name: product.name,
          slug: product.slug,
          imageUrl: product.imageUrl,
          weight: product.weight,
          price: product.price,
          venueId: selectedVenue.id,
        },
        1,
        "",
      );
    },
    [addItem, selectedVenue],
  );

  const getCartLineForProduct = useCallback(
    (product: MenuProduct) =>
      items.find(
        (it) => it.product.id === product.id && (it.wishes ?? "").trim() === "",
      ) ?? null,
    [items],
  );

  const getQuantityInCart = useCallback(
    (product: MenuProduct) => getCartLineForProduct(product)?.quantity ?? 0,
    [getCartLineForProduct],
  );

  const handleDecrease = useCallback(
    (product: MenuProduct) => {
      const line = getCartLineForProduct(product);
      if (!line) return;
      if (line.quantity <= 1) {
        removeItem(line.cartItemId);
        return;
      }
      updateQuantity(line.cartItemId, line.quantity - 1);
    },
    [getCartLineForProduct, removeItem, updateQuantity],
  );

  const handleRemove = useCallback(
    (product: MenuProduct) => {
      const line = getCartLineForProduct(product);
      if (!line) return;
      removeItem(line.cartItemId);
    },
    [getCartLineForProduct, removeItem],
  );

  const filteredProducts = useMemo(() => {
    if (!activeSlug) return products;
    return products.filter((p) => p.category.slug === activeSlug);
  }, [products, activeSlug]);

  const activeCategoryName = useMemo(() => {
    if (!activeSlug) return null;
    return categories.find((c) => c.slug === activeSlug)?.name ?? null;
  }, [activeSlug, categories]);

  const visibleCategoryCount = categories.length;
  const visibleProductCount = filteredProducts.length;

  if (!venueId) {
    return (
      <div className="bg-[#f6f1ea] px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-[28px] bg-[#2f3a2f] px-6 py-14 text-center text-[#f6f1ea] shadow-[0_22px_55px_rgba(26,26,26,0.16)]">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#c8a97e]">Меню</p>
          <h1 className="mt-3 font-serif text-4xl font-semibold sm:text-5xl">Выберите заведение</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#f6f1ea]/72">
            Чтобы увидеть блюда, цены и популярные позиции, выберите ресторан в вашем городе.
          </p>
          <button
            type="button"
            onClick={() => openVenuePicker(selectedCity ? "venue" : "city")}
            className="mt-7 cursor-pointer rounded-xl bg-[#c8a97e] px-6 py-3 text-sm font-bold uppercase tracking-wide text-[#1a1a1a] transition hover:bg-[#e0bf8d]"
          >
            Выбрать заведение
          </button>
        </div>
      </div>
    );
  }

  if (loading && !products.length) {
    return (
      <div className="bg-[#f6f1ea] px-4 py-10 sm:px-6" aria-busy="true" aria-label="Загрузка меню">
        <div className="mx-auto max-w-7xl animate-pulse space-y-8">
          <div className="h-64 rounded-[28px] bg-vanilla-200" />
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="h-32 w-full rounded-[24px] bg-vanilla-200 lg:h-80 lg:w-64" />
            <div className="grid flex-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((k) => (
                <div key={k} className="h-80 rounded-[24px] bg-vanilla-200" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#f6f1ea] px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-4xl rounded-[24px] border border-red-200 bg-red-50 px-6 py-8 text-center text-sm text-red-900">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f6f1ea] text-[#1a1a1a]">
      <section className="relative overflow-hidden bg-[#1a1a1a] text-[#f6f1ea]">
        <Image
          src="/images/hero/italian-restaurant-hero.png"
          alt=""
          fill
          priority
          className="object-cover opacity-38"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(26,26,26,0.95)_0%,rgba(47,58,47,0.82)_52%,rgba(26,26,26,0.35)_100%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.26em] text-[#c8a97e]">
            {selectedVenue?.name || "ЮрЛа"}
          </p>
          <h1 className="mt-4 max-w-3xl font-serif text-5xl font-semibold leading-[0.98] sm:text-7xl">
            Меню с итальянским характером
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#f6f1ea]/76">
            Паста, горячие блюда, закуски и десерты с акцентом на свежие продукты и спокойную европейскую подачу.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full border border-[#c8a97e]/35 bg-white/8 px-4 py-2 text-[#f6f1ea]/82">
              {visibleCategoryCount} разделов
            </span>
            <span className="rounded-full border border-[#c8a97e]/35 bg-white/8 px-4 py-2 text-[#f6f1ea]/82">
              {products.length} позиций
            </span>
            {selectedVenue?.address ? (
              <span className="rounded-full border border-[#c8a97e]/35 bg-white/8 px-4 py-2 text-[#f6f1ea]/82">
                {selectedVenue.address}
              </span>
            ) : null}
          </div>
        </div>
      </section>

      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 lg:flex-row lg:items-start">
        <aside className="lg:sticky lg:top-24 lg:w-64 lg:shrink-0">
          <div className="rounded-[24px] border border-[#c8a97e]/25 bg-[#2f3a2f] p-3 shadow-[0_18px_42px_rgba(26,26,26,0.12)] lg:p-5">
            <CategorySidebar categories={categories} activeSlug={activeSlug} />
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-12">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#c8a97e]/25 pb-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#c8a97e]">
                {activeSlug ? "Выбранный раздел" : "Все разделы"}
              </p>
              <h2 className="mt-2 font-serif text-4xl font-semibold leading-tight text-[#1a1a1a] sm:text-5xl">
                {activeCategoryName ?? "Полное меню"}
              </h2>
            </div>
            <p className="text-sm text-[#1a1a1a]/58">
              {visibleProductCount} {visibleProductCount === 1 ? "позиция" : "позиций"}
            </p>
          </div>

          {activeSlug ? (
            <section aria-labelledby="menu-section-title">
              <h3 id="menu-section-title" className="sr-only">
                {activeCategoryName ?? "Раздел"}
              </h3>
              <ProductGrid
                products={filteredProducts}
                onAddToCart={handleAdd}
                onDecreaseFromCart={handleDecrease}
                onRemoveFromCart={handleRemove}
                getQuantityInCart={getQuantityInCart}
              />
            </section>
          ) : (
            categories.map((cat) => {
              const items = products.filter((p) => p.categoryId === cat.id);
              return (
                <section
                  key={cat.id}
                  id={`category-${cat.slug}`}
                  className="scroll-mt-28"
                  aria-labelledby={`heading-${cat.id}`}
                >
                  <h2
                    id={`heading-${cat.id}`}
                    className="mb-5 font-serif text-3xl font-semibold text-[#2f3a2f]"
                  >
                    {cat.name}
                  </h2>
                  <ProductGrid
                    products={items}
                    onAddToCart={handleAdd}
                    onDecreaseFromCart={handleDecrease}
                    onRemoveFromCart={handleRemove}
                    getQuantityInCart={getQuantityInCart}
                  />
                </section>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
