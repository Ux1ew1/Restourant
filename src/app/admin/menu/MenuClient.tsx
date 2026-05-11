"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { formatPriceFromKopecks } from "@/lib/utils";
import { useVenueStore } from "@/store/venueStore";

interface ProductRow {
  id: string;
  name: string;
  slug: string;
  price: number;
  weight: string | null;
  isHidden: boolean;
  isStopList: boolean;
  category: { id: string; name: string; slug: string };
}

/**
 * Клиентский список товаров с тоглами скрыть/стоп-лист и удалением.
 */
export function AdminMenuClient() {
  const selectedVenue = useVenueStore((s) => s.selectedVenue);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchProducts = useCallback(async () => {
    if (!selectedVenue) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/products?venueId=${selectedVenue.id}`);
      const json = await res.json() as { ok: boolean; products: ProductRow[] };
      if (json.ok) setProducts(json.products);
    } finally {
      setIsLoading(false);
    }
  }, [selectedVenue]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  async function toggleField(id: string, field: "isHidden" | "isStopList", current: boolean) {
    await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: !current }),
    });
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, [field]: !current } : p));
  }

  async function deleteProduct(id: string, name: string) {
    if (!confirm(`Удалить «${name}»? Если товар уже использовался в заказах — удаление будет отклонено.`)) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    const json = await res.json() as { ok: boolean; error?: string };
    if (json.ok) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } else if (json.error === "PRODUCT_IN_USE") {
      alert("Товар используется в заказах — нельзя удалить. Скройте его вместо удаления.");
    }
  }

  const filtered = products.filter((p) =>
    search ? p.name.toLowerCase().includes(search.toLowerCase()) : true,
  );

  if (!selectedVenue) {
    return (
      <div className="rounded-2xl border border-dashed border-vanilla-300 py-16 text-center text-vanilla-500">
        Выберите заведение на сайте, чтобы управлять его меню.
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-vanilla-900">Меню</h1>
          <p className="mt-0.5 text-sm text-vanilla-600">{selectedVenue.name} · {products.length} позиций</p>
        </div>
        <Link
          href="/admin/menu/new"
          className="rounded-xl bg-vanilla-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-vanilla-400"
        >
          + Добавить блюдо
        </Link>
      </div>

      <div className="mt-5">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по названию..."
          className="w-full rounded-xl border border-vanilla-200 bg-vanilla-50 px-4 py-2.5 text-sm focus:border-vanilla-500 focus:outline-none focus:ring-2 focus:ring-vanilla-500/20"
        />
      </div>

      <div className="mt-5 overflow-x-auto rounded-2xl border border-vanilla-200 bg-white">
        {isLoading ? (
          <div className="p-8 text-center text-vanilla-500">Загрузка...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-vanilla-500">Ничего не найдено</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-vanilla-100 bg-vanilla-50 text-left">
                <th className="px-4 py-3 font-semibold text-vanilla-700">Название</th>
                <th className="px-4 py-3 font-semibold text-vanilla-700">Категория</th>
                <th className="px-4 py-3 font-semibold text-vanilla-700">Цена</th>
                <th className="px-4 py-3 font-semibold text-vanilla-700">Скрыт</th>
                <th className="px-4 py-3 font-semibold text-vanilla-700">Стоп</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-vanilla-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-vanilla-50/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-vanilla-900">{p.name}</p>
                    {p.weight && <p className="text-xs text-vanilla-500">{p.weight}</p>}
                  </td>
                  <td className="px-4 py-3 text-vanilla-600">{p.category.name}</td>
                  <td className="px-4 py-3 font-medium text-vanilla-900">{formatPriceFromKopecks(p.price)}</td>
                  <td className="px-4 py-3">
                    <Toggle
                      value={p.isHidden}
                      onChange={() => toggleField(p.id, "isHidden", p.isHidden)}
                      activeColor="bg-red-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Toggle
                      value={p.isStopList}
                      onChange={() => toggleField(p.id, "isStopList", p.isStopList)}
                      activeColor="bg-orange-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <Link
                        href={`/admin/menu/${p.id}`}
                        className="rounded-lg border border-vanilla-200 px-3 py-1 text-xs font-medium text-vanilla-600 hover:bg-vanilla-100"
                      >
                        Изменить
                      </Link>
                      <button
                        onClick={() => deleteProduct(p.id, p.name)}
                        className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-500 hover:bg-red-50"
                      >
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/** Мини-переключатель для булевых полей */
function Toggle({ value, onChange, activeColor = "bg-vanilla-500" }: { value: boolean; onChange: () => void; activeColor?: string }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${value ? activeColor : "bg-vanilla-200"}`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition ${value ? "translate-x-[18px]" : "translate-x-1"}`}
      />
    </button>
  );
}
