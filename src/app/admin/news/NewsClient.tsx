"use client";

import { useCallback, useEffect, useState } from "react";

import { useVenueStore } from "@/store/venueStore";

interface NewsItem {
  id: string; title: string; imageUrl: string | null;
  content: string | null; isActive: boolean; publishedAt: string; venueId: string | null;
}

/**
 * Управление новостными баннерами: создание, редактирование активности, удаление.
 */
export function AdminNewsClient() {
  const selectedVenue = useVenueStore((s) => s.selectedVenue);
  const [items, setItems] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", imageUrl: "", content: "", isActive: true });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchItems = useCallback(async () => {
    if (!selectedVenue) return;
    setIsLoading(true);
    const res = await fetch(`/api/admin/news?venueId=${selectedVenue.id}`);
    const json = await res.json() as { ok: boolean; items: NewsItem[] };
    if (json.ok) setItems(json.items);
    setIsLoading(false);
  }, [selectedVenue]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  async function addItem() {
    if (!selectedVenue || !form.title.trim()) return;
    setIsSubmitting(true);
    const res = await fetch("/api/admin/news", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, venueId: selectedVenue.id, imageUrl: form.imageUrl || undefined }),
    });
    const json = await res.json() as { ok: boolean };
    if (json.ok) { await fetchItems(); setShowForm(false); setForm({ title: "", imageUrl: "", content: "", isActive: true }); }
    setIsSubmitting(false);
  }

  async function toggleActive(id: string, current: boolean) {
    await fetch(`/api/admin/news/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, isActive: !current } : i));
  }

  async function deleteItem(id: string, title: string) {
    if (!confirm(`Удалить баннер «${title}»?`)) return;
    await fetch(`/api/admin/news/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  const fc = "w-full rounded-xl border border-vanilla-200 bg-vanilla-50 px-4 py-2.5 text-sm focus:border-vanilla-500 focus:outline-none";

  if (!selectedVenue) return <div className="py-16 text-center text-vanilla-500">Выберите заведение.</div>;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold text-vanilla-900">Новости и баннеры</h1>
        <button onClick={() => setShowForm(!showForm)} className="rounded-xl bg-vanilla-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-vanilla-400">
          + Добавить
        </button>
      </div>

      {showForm && (
        <div className="mt-6 rounded-2xl border border-vanilla-200 bg-white p-5 shadow-sm space-y-3">
          <h2 className="font-semibold text-vanilla-900">Новый баннер</h2>
          <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Заголовок *" className={fc} />
          <input value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} placeholder="URL изображения" className={fc} />
          <textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} placeholder="Текст (необязательно)" rows={3} className={`${fc} resize-none`} />
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} className="h-4 w-4" />
            <span className="text-sm text-vanilla-700">Опубликован</span>
          </label>
          <div className="flex gap-3">
            <button onClick={addItem} disabled={isSubmitting || !form.title.trim()} className="rounded-xl bg-vanilla-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
              {isSubmitting ? "Сохранение..." : "Создать"}
            </button>
            <button onClick={() => setShowForm(false)} className="text-sm text-vanilla-500">Отмена</button>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {isLoading && <div className="py-8 text-center text-vanilla-500">Загрузка...</div>}
        {!isLoading && items.length === 0 && <div className="rounded-2xl border border-dashed border-vanilla-300 py-16 text-center text-vanilla-500">Баннеров нет</div>}
        {items.map((item) => (
          <div key={item.id} className="flex items-start gap-4 rounded-2xl border border-vanilla-200 bg-white p-4">
            {item.imageUrl && (
              <img src={item.imageUrl} alt="" className="h-16 w-24 rounded-xl object-cover shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-vanilla-900 truncate">{item.title}</p>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${item.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                  {item.isActive ? "Опубликован" : "Скрыт"}
                </span>
              </div>
              {item.content && <p className="mt-0.5 text-xs text-vanilla-500 line-clamp-1">{item.content}</p>}
              <p className="mt-1 text-xs text-vanilla-400">{new Date(item.publishedAt).toLocaleDateString("ru-RU")}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button onClick={() => toggleActive(item.id, item.isActive)} className={`rounded-lg border px-3 py-1 text-xs font-medium ${item.isActive ? "border-red-200 text-red-500 hover:bg-red-50" : "border-green-200 text-green-600 hover:bg-green-50"}`}>
                {item.isActive ? "Скрыть" : "Показать"}
              </button>
              <button onClick={() => deleteItem(item.id, item.title)} className="rounded-lg border border-red-200 px-3 py-1 text-xs text-red-500 hover:bg-red-50">
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
