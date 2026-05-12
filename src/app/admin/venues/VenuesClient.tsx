"use client";

import { useEffect, useState } from "react";

import { VenueForm } from "@/components/admin/VenueForm";

interface City { id: string; name: string; slug: string; }
interface VenueRow {
  id: string; name: string; slug: string; address: string;
  phone: string | null; logoUrl: string | null; isActive: boolean;
  city: City;
}

/**
 * Страница управления заведениями и городами.
 */
export function AdminVenuesClient() {
  const [venues, setVenues] = useState<VenueRow[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editVenue, setEditVenue] = useState<VenueRow | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/venues").then((r) => r.json()),
      fetch("/api/cities").then((r) => r.json()),
    ]).then(([vRes, cRes]) => {
      if ((vRes as { ok: boolean; venues: VenueRow[] }).ok) setVenues((vRes as { ok: boolean; venues: VenueRow[] }).venues);
      if ((cRes as { ok: boolean; cities: City[] }).ok) setCities((cRes as { ok: boolean; cities: City[] }).cities);
      setIsLoading(false);
    });
  }, []);

  async function toggleActive(id: string, current: boolean) {
    await fetch(`/api/admin/venues`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: !current }),
    });
    setVenues((prev) => prev.map((v) => v.id === id ? { ...v, isActive: !current } : v));
  }

  async function handleSubmit(data: Parameters<typeof VenueForm>[0]["defaultValues"] & object) {
    setIsSubmitting(true);
    const url = editVenue ? `/api/admin/venues` : "/api/admin/venues";
    const method = editVenue ? "PATCH" : "POST";
    const body = editVenue ? { id: editVenue.id, ...data } : data;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json() as { ok: boolean };
    if (json.ok) {
      const vRes = await fetch("/api/admin/venues").then((r) => r.json()) as { ok: boolean; venues: VenueRow[] };
      if (vRes.ok) setVenues(vRes.venues);
      setShowForm(false);
      setEditVenue(null);
    }
    setIsSubmitting(false);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold text-vanilla-900">Заведения</h1>
        <button
          onClick={() => { setShowForm(true); setEditVenue(null); }}
          className="rounded-xl bg-vanilla-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-vanilla-400"
        >
          + Добавить
        </button>
      </div>

      {/* Форма */}
      {showForm && (
        <div className="mt-6 rounded-2xl border border-vanilla-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-vanilla-900">{editVenue ? "Редактировать" : "Новое заведение"}</h2>
            <button onClick={() => { setShowForm(false); setEditVenue(null); }} className="text-sm text-vanilla-500">✕</button>
          </div>
          <VenueForm
            cities={cities}
            defaultValues={editVenue ? {
              cityId: editVenue.city.id, name: editVenue.name, slug: editVenue.slug,
              address: editVenue.address, phone: editVenue.phone ?? "", logoUrl: editVenue.logoUrl ?? "",
              isActive: editVenue.isActive,
            } : undefined}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel={editVenue ? "Сохранить" : "Создать"}
          />
        </div>
      )}

      {/* Список */}
      <div className="mt-6 space-y-3">
        {isLoading && <div className="py-16 text-center text-vanilla-500">Загрузка...</div>}
        {!isLoading && venues.length === 0 && <div className="py-16 text-center text-vanilla-500">Заведений нет</div>}
        {venues.map((v) => (
          <div key={v.id} className="rounded-2xl border border-vanilla-200 bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-vanilla-900">{v.name}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${v.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                    {v.isActive ? "Активно" : "Отключено"}
                  </span>
                </div>
                <p className="text-sm text-vanilla-600">{v.city.name} · {v.address}</p>
                {v.phone && <p className="text-xs text-vanilla-500">{v.phone}</p>}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setEditVenue(v); setShowForm(true); }}
                  className="rounded-lg border border-vanilla-200 px-3 py-1 text-xs text-vanilla-600 hover:bg-vanilla-100"
                >
                  Изменить
                </button>
                <button
                  onClick={() => toggleActive(v.id, v.isActive)}
                  className={`rounded-lg border px-3 py-1 text-xs font-medium transition ${v.isActive ? "border-red-200 text-red-500 hover:bg-red-50" : "border-green-200 text-green-600 hover:bg-green-50"}`}
                >
                  {v.isActive ? "Отключить" : "Включить"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
