"use client";

import { useCallback, useEffect, useState } from "react";

import { VenueForm } from "@/components/admin/VenueForm";

interface City {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

interface VenueRow {
  id: string;
  name: string;
  slug: string;
  address: string;
  phone: string | null;
  logoUrl: string | null;
  isActive: boolean;
  storyEnabled: boolean;
  storyTitle: string | null;
  storyText: string | null;
  bookingEnabled: boolean;
  city: City;
}

async function fetchAdminCities(): Promise<City[]> {
  const res = await fetch("/api/admin/cities");
  const json = (await res.json()) as { ok: boolean; cities?: City[] };
  return json.ok && Array.isArray(json.cities) ? json.cities : [];
}

async function fetchAdminVenues(): Promise<VenueRow[]> {
  const res = await fetch("/api/admin/venues");
  const json = (await res.json()) as { ok: boolean; venues?: VenueRow[] };
  return json.ok && Array.isArray(json.venues) ? json.venues : [];
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

  const reload = useCallback(async () => {
    const [v, c] = await Promise.all([fetchAdminVenues(), fetchAdminCities()]);
    setVenues(v);
    setCities(c);
  }, []);

  useEffect(() => {
    reload().finally(() => setIsLoading(false));
  }, [reload]);

  async function toggleActive(id: string, current: boolean) {
    await fetch(`/api/admin/venues`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: !current }),
    });
    setVenues((prev) => prev.map((v) => (v.id === id ? { ...v, isActive: !current } : v)));
  }

  async function deleteVenue(id: string, name: string) {
    if (
      !confirm(
        `Удалить заведение «${name}» безвозвратно? Меню и связанные данные будут удалены. Если были заказы — удаление будет отклонено.`,
      )
    ) {
      return;
    }
    const res = await fetch(`/api/admin/venues?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    const json = (await res.json()) as { ok: boolean; error?: string; orderCount?: number };
    if (json.ok) {
      await reload();
    } else if (json.error === "VENUE_HAS_ORDERS") {
      alert(
        `Нельзя удалить: по заведению есть заказы (${json.orderCount ?? "?"}). Отключите точку или обратитесь к разработчику для архивации.`,
      );
    } else {
      alert("Не удалось удалить заведение.");
    }
  }

  const createCityInForm = useCallback(async (data: { name: string }) => {
      const res = await fetch("/api/admin/cities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name.trim() }),
      });
      const json = (await res.json()) as { ok: boolean; city?: { id: string }; error?: string };
      if (json.ok && json.city?.id) {
        setCities(await fetchAdminCities());
        return { ok: true as const, id: json.city.id };
      }
      if (json.error === "SLUG_TAKEN") {
        return { ok: false as const, error: "Город с таким адресом в ссылке уже есть." };
      }
      return { ok: false as const, error: "Не удалось создать город." };
    },
    []);

  async function handleSubmit(data: Parameters<typeof VenueForm>[0]["defaultValues"] & object) {
    setIsSubmitting(true);
    const method = editVenue ? "PATCH" : "POST";
    const body = editVenue ? { id: editVenue.id, ...data } : data;

    const res = await fetch("/api/admin/venues", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await res.json()) as { ok: boolean };
    if (json.ok) {
      await reload();
      setShowForm(false);
      setEditVenue(null);
    }
    setIsSubmitting(false);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl font-bold text-vanilla-900">Заведения</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditVenue(null);
          }}
          className="rounded-xl bg-vanilla-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-vanilla-400"
        >
          + Добавить заведение
        </button>
      </div>

      {showForm && (
        <div className="mt-6 rounded-2xl border border-vanilla-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-vanilla-900">{editVenue ? "Редактировать заведение" : "Новое заведение"}</h2>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditVenue(null);
              }}
              className="text-sm text-vanilla-500"
            >
              ✕
            </button>
          </div>

          <VenueForm
            key={editVenue?.id ?? "new-venue"}
            cities={cities}
            onCreateCity={createCityInForm}
            defaultValues={
              editVenue
                ? {
                    cityId: editVenue.city.id,
                    name: editVenue.name,
                    slug: editVenue.slug,
                    address: editVenue.address,
                    phone: editVenue.phone ?? "",
                    logoUrl: editVenue.logoUrl ?? "",
                    isActive: editVenue.isActive,
                    storyEnabled: editVenue.storyEnabled,
                    storyTitle: editVenue.storyTitle ?? "Итальянские традиции в каждом блюде",
                    storyText:
                      editVenue.storyText ??
                      "Мы вдохновлены уютными семейными ресторанами северной Италии и европейскими кулинарными традициями. Каждое блюдо — это сочетание качества, вкуса и любви к своему делу.",
                    bookingEnabled: editVenue.bookingEnabled,
                  }
                : undefined
            }
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel={editVenue ? "Сохранить" : "Создать"}
          />
        </div>
      )}

      <div className="mt-6 space-y-3">
        {isLoading && <div className="py-16 text-center text-vanilla-500">Загрузка...</div>}
        {!isLoading && venues.length === 0 && <div className="py-16 text-center text-vanilla-500">Заведений нет</div>}
        {venues.map((v) => (
          <div key={v.id} className="rounded-2xl border border-vanilla-200 bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-vanilla-900">{v.name}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${v.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
                  >
                    {v.isActive ? "Активно" : "Отключено"}
                  </span>
                  {v.storyEnabled ? (
                    <span className="rounded-full bg-vanilla-100 px-2 py-0.5 text-xs font-medium text-vanilla-700">
                      История
                    </span>
                  ) : null}
                  {v.bookingEnabled ? (
                    <span className="rounded-full bg-vanilla-100 px-2 py-0.5 text-xs font-medium text-vanilla-700">
                      Бронь
                    </span>
                  ) : null}
                </div>
                <p className="text-sm text-vanilla-600">
                  {v.city.name} · {v.address}
                </p>
                {v.phone && <p className="text-xs text-vanilla-500">{v.phone}</p>}
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditVenue(v);
                    setShowForm(true);
                  }}
                  className="rounded-lg border border-vanilla-200 px-3 py-1 text-xs text-vanilla-600 hover:bg-vanilla-100"
                >
                  Изменить
                </button>
                <button
                  type="button"
                  onClick={() => toggleActive(v.id, v.isActive)}
                  className={`rounded-lg border px-3 py-1 text-xs font-medium transition ${v.isActive ? "border-red-200 text-red-500 hover:bg-red-50" : "border-green-200 text-green-600 hover:bg-green-50"}`}
                >
                  {v.isActive ? "Отключить" : "Включить"}
                </button>
                <button
                  type="button"
                  onClick={() => deleteVenue(v.id, v.name)}
                  className="rounded-lg border border-red-300 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
