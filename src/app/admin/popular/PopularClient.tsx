"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";

import { useVenueStore } from "@/store/venueStore";
import { formatPriceFromKopecks } from "@/lib/utils";

interface PopularItem {
  id: string; sortOrder: number;
  product: { id: string; name: string; imageUrl: string | null; price: number };
}

interface ProductOption { id: string; name: string; price: number; }

/**
 * Управление популярными позициями: добавление из списка товаров, сортировка, удаление.
 */
export function AdminPopularClient() {
  const selectedVenue = useVenueStore((s) => s.selectedVenue);
  const [items, setItems] = useState<PopularItem[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const fetchData = useCallback(async () => {
    if (!selectedVenue) return;
    setIsLoading(true);
    const [popRes, prodRes] = await Promise.all([
      fetch(`/api/admin/popular?venueId=${selectedVenue.id}`),
      fetch(`/api/admin/products?venueId=${selectedVenue.id}`),
    ]);
    const popJson = await popRes.json() as { ok: boolean; items: PopularItem[] };
    const prodJson = await prodRes.json() as { ok: boolean; products: ProductOption[] };
    if (popJson.ok) setItems(popJson.items);
    if (prodJson.ok) setProducts(prodJson.products);
    setIsLoading(false);
  }, [selectedVenue]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function addPopular() {
    if (!selectedVenue || !selectedProductId) return;
    setIsAdding(true);
    const res = await fetch("/api/admin/popular", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ venueId: selectedVenue.id, productId: selectedProductId, sortOrder: items.length }),
    });
    const json = await res.json() as { ok: boolean; error?: string };
    if (json.ok) { await fetchData(); setSelectedProductId(""); }
    else if (json.error === "ALREADY_EXISTS") alert("Этот товар уже в популярных");
    setIsAdding(false);
  }

  async function removePopular(id: string) {
    await fetch(`/api/admin/popular/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function moveItem(id: string, direction: "up" | "down") {
    const idx = items.findIndex((i) => i.id === id);
    if (idx < 0) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= items.length) return;

    const newItems = [...items];
    [newItems[idx], newItems[swapIdx]] = [newItems[swapIdx], newItems[idx]];
    const reordered = newItems.map((it, i) => ({ ...it, sortOrder: i }));
    setItems(reordered);

    await Promise.all(
      reordered.map((it) =>
        fetch(`/api/admin/popular/${it.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sortOrder: it.sortOrder }),
        }),
      ),
    );
  }

  const existingProductIds = new Set(items.map((i) => i.product.id));
  const availableProducts = products.filter((p) => !existingProductIds.has(p.id));

  if (!selectedVenue) return <div className="py-16 text-center text-vanilla-500">Выберите заведение.</div>;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-serif text-2xl font-bold text-vanilla-900">Популярные позиции</h1>
      <p className="mt-0.5 text-sm text-vanilla-600">{selectedVenue.name}</p>

      {/* Добавить */}
      <div className="mt-6 flex gap-3">
        <select
          value={selectedProductId}
          onChange={(e) => setSelectedProductId(e.target.value)}
          className="flex-1 rounded-xl border border-vanilla-200 bg-vanilla-50 px-4 py-2.5 text-sm focus:border-vanilla-500 focus:outline-none"
        >
          <option value="">— выберите блюдо —</option>
          {availableProducts.map((p) => (
            <option key={p.id} value={p.id}>{p.name} · {formatPriceFromKopecks(p.price)}</option>
          ))}
        </select>
        <button
          onClick={addPopular}
          disabled={isAdding || !selectedProductId}
          className="rounded-xl bg-vanilla-500 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          Добавить
        </button>
      </div>

      {/* Список */}
      <div className="mt-5 space-y-2">
        {isLoading && <div className="py-8 text-center text-vanilla-500">Загрузка...</div>}
        {!isLoading && items.length === 0 && (
          <div className="rounded-2xl border border-dashed border-vanilla-300 py-16 text-center text-vanilla-500">
            Добавьте популярные позиции выше
          </div>
        )}
        {items.map((item, idx) => (
          <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-vanilla-200 bg-white p-3">
            <div className="flex flex-col gap-0.5">
              <button onClick={() => moveItem(item.id, "up")} disabled={idx === 0} className="text-xs text-vanilla-400 hover:text-vanilla-700 disabled:opacity-30">▲</button>
              <button onClick={() => moveItem(item.id, "down")} disabled={idx === items.length - 1} className="text-xs text-vanilla-400 hover:text-vanilla-700 disabled:opacity-30">▼</button>
            </div>
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-vanilla-100">
              {item.product.imageUrl ? (
                <Image src={item.product.imageUrl} alt={item.product.name} fill sizes="48px" className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-vanilla-400 text-xs">—</div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-vanilla-900">{item.product.name}</p>
              <p className="text-xs text-vanilla-500">{formatPriceFromKopecks(item.product.price)}</p>
            </div>
            <button
              onClick={() => removePopular(item.id)}
              className="rounded-lg border border-red-200 px-3 py-1 text-xs text-red-500 hover:bg-red-50"
            >
              Убрать
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
