"use client";

import { useState } from "react";

import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { VenuePickerHost } from "@/components/layout/VenuePickerHost";
import { useVenueStore } from "@/store/venueStore";

/**
 * Кнопка открытия выбора города/заведения для разделов админки, завязанных на `venueStore`.
 */
function AdminVenuePickerTrigger({ className = "" }: { className?: string }) {
  const selectedVenue = useVenueStore((s) => s.selectedVenue);
  const selectedCity = useVenueStore((s) => s.selectedCity);
  const openVenuePicker = useVenueStore((s) => s.openVenuePicker);

  const label = selectedVenue?.name ?? "Выберите заведение";
  const sub = selectedCity && !selectedVenue ? selectedCity.name : selectedVenue ? selectedCity?.name ?? "" : null;

  return (
    <button
      type="button"
      onClick={() => openVenuePicker(selectedCity ? "venue" : "city")}
      className={`min-w-0 w-full cursor-pointer rounded-xl border border-vanilla-200 bg-white px-3 py-2 text-left text-sm shadow-sm transition hover:border-vanilla-300 hover:bg-vanilla-50 ${className}`}
    >
      <span className="block truncate font-medium text-vanilla-900">{label}</span>
      {sub ? <span className="block truncate text-xs text-vanilla-500">{sub}</span> : null}
      <span className="mt-0.5 block text-[11px] text-vanilla-500">Нажмите, чтобы сменить</span>
    </button>
  );
}

/**
 * Оболочка админ-панели: выезжающий сайдбар на мобильных, выбор заведения, глобальный пикер.
 */
export function AdminDashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-vanilla-50">
      <VenuePickerHost />

      {mobileNavOpen ? (
        <button
          type="button"
          aria-label="Закрыть меню"
          className="fixed inset-0 z-40 cursor-pointer bg-black/40 lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}

      <AdminSidebar
        mobileNavOpen={mobileNavOpen}
        onCloseMobileNav={() => setMobileNavOpen(false)}
        venuePickerSlot={<AdminVenuePickerTrigger />}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-vanilla-200 bg-vanilla-50 px-3 sm:px-4 lg:hidden">
          <button
            type="button"
            aria-expanded={mobileNavOpen}
            aria-controls="admin-sidebar"
            aria-label={mobileNavOpen ? "Закрыть меню" : "Открыть меню"}
            onClick={() => setMobileNavOpen((o) => !o)}
            className="cursor-pointer rounded-xl border border-vanilla-200 bg-white p-2 text-vanilla-800 shadow-sm transition hover:bg-vanilla-100"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
              {mobileNavOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          <AdminVenuePickerTrigger className="min-w-0 flex-1" />
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
