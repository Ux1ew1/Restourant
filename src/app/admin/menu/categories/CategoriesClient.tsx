"use client";

import { useCallback, useEffect, useState } from "react";

import { useVenueStore } from "@/store/venueStore";

interface CategoryRow {
  id: string; name: string; slug: string; sortOrder: number; isActive: boolean;
}

/**
 * Управление категориями меню: добавление, переименование, порядок, удаление.
 */
export function AdminCategoriesClient() {
  const selectedVenue = useVenueStore((s) => s.selectedVenue);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Форма добавления
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Инлайн-редактирование
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const fetchCategories = useCallback(async () => {
    if (!selectedVenue) return;
    setIsLoading(true);
    const res = await fetch(`/api/admin/categories?venueId=${selectedVenue.id}`);
    const json = await res.json() as { ok: boolean; categories: CategoryRow[] };
    if (json.ok) setCategories(json.categories);
    setIsLoading(false);
  }, [selectedVenue]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  function autoSlug(name: string) {
    return name.toLowerCase()
      .replace(/[а-яё]/g, (ch) => {
        const map: Record<string, string> = { а:"a",б:"b",в:"v",г:"g",д:"d",е:"e",ё:"yo",ж:"zh",з:"z",и:"i",й:"y",к:"k",л:"l",м:"m",н:"n",о:"o",п:"p",р:"r",с:"s",т:"t",у:"u",ф:"f",х:"kh",ц:"ts",ч:"ch",ш:"sh",щ:"shch",ъ:"",ы:"y",ь:"",э:"e",ю:"yu",я:"ya" };
        return map[ch] ?? ch;
      })
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  async function addCategory() {
    if (!selectedVenue || !newName.trim()) return;
    setIsAdding(true);
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ venueId: selectedVenue.id, name: newName.trim(), slug: newSlug || autoSlug(newName), sortOrder: categories.length }),
    });
    const json = await res.json() as { ok: boolean; category: CategoryRow; error?: string };
    if (json.ok) {
      setCategories((prev) => [...prev, json.category]);
      setNewName(""); setNewSlug("");
    } else {
      alert(json.error === "SLUG_TAKEN" ? "Такой slug уже есть" : "Ошибка создания");
    }
    setIsAdding(false);
  }

  async function saveEdit(id: string) {
    if (!editName.trim()) return;
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName.trim() }),
    });
    const json = await res.json() as { ok: boolean; category: CategoryRow };
    if (json.ok) {
      setCategories((prev) => prev.map((c) => c.id === id ? { ...c, name: json.category.name } : c));
    }
    setEditId(null);
  }

  async function updateOrder(id: string, direction: "up" | "down") {
    const idx = categories.findIndex((c) => c.id === id);
    if (idx < 0) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= categories.length) return;

    const newArr = [...categories];
    const aOrder = newArr[idx].sortOrder;
    const bOrder = newArr[swapIdx].sortOrder;
    newArr[idx] = { ...newArr[idx], sortOrder: bOrder };
    newArr[swapIdx] = { ...newArr[swapIdx], sortOrder: aOrder };
    newArr.sort((a, b) => a.sortOrder - b.sortOrder);
    setCategories(newArr);

    await Promise.all([
      fetch(`/api/admin/categories/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sortOrder: bOrder }) }),
      fetch(`/api/admin/categories/${newArr[swapIdx === idx - 1 ? 0 : swapIdx].id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sortOrder: aOrder }) }),
    ]);
  }

  async function deleteCategory(id: string, name: string) {
    if (!confirm(`Удалить категорию «${name}»? Все товары в ней тоже будут удалены!`)) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    const json = await res.json() as { ok: boolean; error?: string };
    if (json.ok) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } else {
      alert(json.error === "CATEGORY_HAS_PRODUCTS" ? "В категории есть товары — удалите их сначала" : "Ошибка удаления");
    }
  }

  if (!selectedVenue) {
    return <div className="py-16 text-center text-vanilla-500">Выберите заведение на сайте.</div>;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-serif text-2xl font-bold text-vanilla-900">Категории</h1>
      <p className="mt-0.5 text-sm text-vanilla-600">{selectedVenue.name}</p>

      {/* Форма добавления */}
      <div className="mt-6 rounded-2xl border border-vanilla-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-vanilla-800">Добавить категорию</h2>
        <div className="flex gap-3">
          <input
            value={newName}
            onChange={(e) => { setNewName(e.target.value); if (!newSlug) setNewSlug(autoSlug(e.target.value)); }}
            placeholder="Название"
            className="flex-1 rounded-xl border border-vanilla-200 bg-vanilla-50 px-4 py-2 text-sm focus:border-vanilla-500 focus:outline-none"
          />
          <input
            value={newSlug}
            onChange={(e) => setNewSlug(e.target.value)}
            placeholder="slug"
            className="w-32 rounded-xl border border-vanilla-200 bg-vanilla-50 px-4 py-2 text-sm focus:border-vanilla-500 focus:outline-none"
          />
          <button
            onClick={addCategory}
            disabled={isAdding || !newName.trim()}
            className="rounded-xl bg-vanilla-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-vanilla-400 disabled:opacity-60"
          >
            Добавить
          </button>
        </div>
      </div>

      {/* Список */}
      <div className="mt-5 rounded-2xl border border-vanilla-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-vanilla-500">Загрузка...</div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-vanilla-500">Категорий нет</div>
        ) : (
          <ul className="divide-y divide-vanilla-100">
            {categories.map((cat, idx) => (
              <li key={cat.id} className="flex items-center gap-3 px-5 py-3">
                {/* Сортировка */}
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => updateOrder(cat.id, "up")} disabled={idx === 0} className="text-vanilla-400 hover:text-vanilla-700 disabled:opacity-30 text-xs">▲</button>
                  <button onClick={() => updateOrder(cat.id, "down")} disabled={idx === categories.length - 1} className="text-vanilla-400 hover:text-vanilla-700 disabled:opacity-30 text-xs">▼</button>
                </div>

                {editId === cat.id ? (
                  <div className="flex flex-1 items-center gap-2">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") saveEdit(cat.id); if (e.key === "Escape") setEditId(null); }}
                      autoFocus
                      className="flex-1 rounded-lg border border-vanilla-300 px-3 py-1 text-sm focus:outline-none"
                    />
                    <button onClick={() => saveEdit(cat.id)} className="rounded-lg bg-vanilla-500 px-3 py-1 text-xs font-semibold text-white">Сохранить</button>
                    <button onClick={() => setEditId(null)} className="text-xs text-vanilla-500">Отмена</button>
                  </div>
                ) : (
                  <div className="flex flex-1 items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-vanilla-900">{cat.name}</p>
                      <p className="text-xs text-vanilla-500">{cat.slug} · порядок: {cat.sortOrder}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setEditId(cat.id); setEditName(cat.name); }}
                        className="rounded-lg border border-vanilla-200 px-3 py-1 text-xs text-vanilla-600 hover:bg-vanilla-100"
                      >
                        Изменить
                      </button>
                      <button
                        onClick={() => deleteCategory(cat.id, cat.name)}
                        className="rounded-lg border border-red-200 px-3 py-1 text-xs text-red-500 hover:bg-red-50"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
