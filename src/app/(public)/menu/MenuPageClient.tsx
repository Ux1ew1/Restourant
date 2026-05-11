"use client";

import { useRouter, useSearchParams } from "next/navigation";
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
  const { addItem } = useCart();
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
            cache: "no-store",
          }),
          fetch(`/api/products?venueId=${encodeURIComponent(venueId)}`, {
            signal: controller.signal,
            cache: "no-store",
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

  const filteredProducts = useMemo(() => {
    if (!activeSlug) return products;
    return products.filter((p) => p.category.slug === activeSlug);
  }, [products, activeSlug]);

  const activeCategoryName = useMemo(() => {
    if (!activeSlug) return null;
    return categories.find((c) => c.slug === activeSlug)?.name ?? null;
  }, [activeSlug, categories]);

  if (!venueId) {
    return (
      <div className="rounded-2xl border border-vanilla-200 bg-vanilla-100/60 px-6 py-12 text-center">
        <h1 className="font-serif text-2xl font-semibold text-vanilla-900">Меню</h1>
        <p className="mt-3 text-sm text-vanilla-600">
          Чтобы увидеть блюда и цены, выберите заведение.
        </p>
        <button
          type="button"
          onClick={() => openVenuePicker(selectedCity ? "venue" : "city")}
          className="mt-6 rounded-xl bg-vanilla-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-vanilla-400"
        >
          Выбрать заведение
        </button>
      </div>
    );
  }

  if (loading && !products.length) {
    return (
      <div className="animate-pulse space-y-8" aria-busy="true" aria-label="Загрузка меню">
        <div className="h-9 w-40 rounded-lg bg-vanilla-200" />
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="h-32 w-full rounded-2xl bg-vanilla-200 lg:h-64 lg:w-52" />
          <div className="grid flex-1 gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((k) => (
              <div key={k} className="h-64 rounded-2xl bg-vanilla-200" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center text-sm text-red-900">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-serif text-3xl font-semibold text-vanilla-900">Меню</h1>
        {selectedVenue ? (
          <p className="mt-1 text-sm text-vanilla-600">{selectedVenue.name}</p>
        ) : null}
      </header>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <aside className="lg:sticky lg:top-24 lg:w-56 lg:shrink-0">
          <div className="rounded-2xl border border-vanilla-200 bg-vanilla-100/50 p-3 lg:p-4">
            <CategorySidebar categories={categories} activeSlug={activeSlug} />
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-10">
          {activeSlug ? (
            <section aria-labelledby="menu-section-title">
              <h2
                id="menu-section-title"
                className="mb-4 font-serif text-xl font-semibold text-vanilla-900"
              >
                {activeCategoryName ?? "Раздел"}
              </h2>
              <ProductGrid products={filteredProducts} onAddToCart={handleAdd} />
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
                    className="mb-4 font-serif text-xl font-semibold text-vanilla-900"
                  >
                    {cat.name}
                  </h2>
                  <ProductGrid products={items} onAddToCart={handleAdd} />
                </section>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
