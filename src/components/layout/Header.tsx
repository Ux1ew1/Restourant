"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

import { useCart } from "@/hooks/useCart";
import { useVenue } from "@/hooks/useVenue";

export function Header() {
  const { selectedVenue, selectedCity, openVenuePicker } = useVenue();
  const { totalQuantity } = useCart();
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const venueTitle = selectedVenue?.name ?? "Выберите заведение";
  const address = selectedVenue?.address ?? "Адрес появится после выбора точки";
  const venueBasePath = selectedVenue ? `/${selectedVenue.slug}` : "";
  const homeHref = selectedVenue ? venueBasePath : "/";
  const menuHref = selectedVenue ? `${venueBasePath}/menu` : "/menu";
  const storyHref = `${homeHref === "/" ? "" : homeHref}/#restaurant-story`;
  const contactsHref = `${homeHref === "/" ? "" : homeHref}/#contacts`;
  const bookingHref = `${homeHref === "/" ? "" : homeHref}/#booking`;

  return (
    <header className="sticky top-0 z-40 border-b border-[#c8a97e]/25 bg-[#1a1a1a]/75 text-[#f6f1ea] shadow-[0_12px_40px_rgba(26,26,26,0.18)] backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-4">
          <Link
            href={homeHref}
            className="font-serif text-2xl font-semibold tracking-tight text-[#f6f1ea] transition hover:text-[#c8a97e]"
            aria-label="На главную"
          >
            ЮрЛа
          </Link>

          <button
            type="button"
            onClick={() => openVenuePicker(selectedCity ? "venue" : "city")}
            className="hidden min-w-0 cursor-pointer rounded-xl px-2 py-1 text-left transition hover:bg-white/10 sm:block"
          >
            <div className="truncate text-sm font-semibold text-[#f6f1ea]">{venueTitle}</div>
            <div className="text-xs text-[#c8a97e]">Сменить заведение</div>
          </button>
        </div>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Основная навигация">
          <Link href={homeHref} className="text-sm font-medium text-[#f6f1ea]/85 transition hover:text-[#c8a97e]">
            Главная
          </Link>
          <Link href={menuHref} className="text-sm font-medium text-[#f6f1ea]/85 transition hover:text-[#c8a97e]">
            Меню
          </Link>
          <Link href={storyHref} className="text-sm font-medium text-[#f6f1ea]/85 transition hover:text-[#c8a97e]">
            О ресторане
          </Link>
          <Link href={contactsHref} className="text-sm font-medium text-[#f6f1ea]/85 transition hover:text-[#c8a97e]">
            Контакты
          </Link>
        </nav>

        <div className="hidden items-center justify-end gap-3 md:flex">
          <p className="max-w-[190px] truncate text-right text-sm text-[#f6f1ea]/75" title={address}>
            {address}
          </p>
          <Link
            href={bookingHref}
            className="rounded-xl bg-[#c8a97e] px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#1a1a1a] shadow-[0_10px_24px_rgba(200,169,126,0.26)] transition hover:bg-[#e0bf8d]"
          >
            Забронировать
          </Link>

          <div className="flex items-center gap-2 border-l border-[#c8a97e]/25 pl-3">
            {status === "loading" ? (
              <span className="text-sm text-[#f6f1ea]/60">...</span>
            ) : session?.user ? (
              <div className="flex flex-col items-end text-right text-sm">
                <span className="font-medium text-[#f6f1ea]">
                  {session.user.name || session.user.email}
                </span>
                <button
                  type="button"
                  className="mt-1 text-xs font-medium text-[#c8a97e] underline decoration-[#c8a97e]/50 underline-offset-2 hover:text-[#f6f1ea]"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Выйти
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm">
                <Link href="/login" className="rounded-xl px-3 py-1.5 font-medium text-[#f6f1ea] hover:bg-white/10">
                  Войти
                </Link>
                <Link href="/register" className="rounded-xl border border-[#c8a97e]/50 px-3 py-1.5 font-medium text-[#c8a97e] hover:bg-[#c8a97e]/10">
                  Регистрация
                </Link>
              </div>
            )}
          </div>

          <CartLink totalQuantity={totalQuantity} />
        </div>

        <div className="flex items-center justify-end gap-2 md:hidden">
          <CartLink totalQuantity={totalQuantity} compact />
          <button
            type="button"
            className="rounded-xl border border-[#c8a97e]/35 bg-white/5 p-2 text-[#f6f1ea] transition hover:bg-white/10"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? "Закрыть меню" : "Открыть меню"}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" className="h-5 w-5" aria-hidden>
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" className="h-5 w-5" aria-hidden>
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            id="mobile-nav"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden border-t border-[#c8a97e]/25 bg-[#1a1a1a]/95 md:hidden"
          >
            <div className="space-y-4 px-4 py-4">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  openVenuePicker(selectedCity ? "venue" : "city");
                }}
                className="w-full rounded-xl bg-white/5 px-3 py-2 text-left"
              >
                <span className="block text-sm font-semibold text-[#f6f1ea]">{venueTitle}</span>
                <span className="block text-xs text-[#c8a97e]">{address}</span>
              </button>

              <div className="flex flex-col gap-2">
                {[
                  ["Главная", homeHref],
                  ["Меню", menuHref],
                  ["О ресторане", storyHref],
                  ["Контакты", contactsHref],
                ].map(([label, href]) => (
                  <Link
                    key={href}
                    href={href}
                    className="rounded-xl py-2 text-sm font-medium text-[#f6f1ea]"
                    onClick={() => setMobileOpen(false)}
                  >
                    {label}
                  </Link>
                ))}
              </div>

              <Link
                href={bookingHref}
                className="block rounded-xl bg-[#c8a97e] px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-[#1a1a1a]"
                onClick={() => setMobileOpen(false)}
              >
                Забронировать
              </Link>

              {status === "loading" ? (
                <p className="text-sm text-[#f6f1ea]/60">Загрузка...</p>
              ) : session?.user ? (
                <div className="space-y-2 border-t border-[#c8a97e]/25 pt-3">
                  <p className="text-sm font-medium text-[#f6f1ea]">
                    {session.user.name || session.user.email}
                  </p>
                  <button
                    type="button"
                    className="text-sm font-medium text-[#c8a97e] underline"
                    onClick={() => {
                      setMobileOpen(false);
                      void signOut({ callbackUrl: "/" });
                    }}
                  >
                    Выйти
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 border-t border-[#c8a97e]/25 pt-3">
                  <Link href="/login" className="rounded-xl border border-[#c8a97e]/35 py-2 text-center text-sm font-medium" onClick={() => setMobileOpen(false)}>
                    Войти
                  </Link>
                  <Link href="/register" className="rounded-xl bg-[#c8a97e] py-2 text-center text-sm font-medium text-[#1a1a1a]" onClick={() => setMobileOpen(false)}>
                    Регистрация
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

function CartLink({
  totalQuantity,
  compact = false,
}: {
  totalQuantity: number;
  compact?: boolean;
}) {
  return (
    <Link
      href="/cart"
      className="relative rounded-xl border border-[#c8a97e]/35 bg-white/5 p-2 text-[#f6f1ea] transition hover:border-[#c8a97e] hover:bg-white/10"
      aria-label={`Корзина, позиций: ${totalQuantity}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={compact ? "h-5 w-5" : "h-5 w-5"} aria-hidden>
        <path d="M6 6h15l-1.5 9h-12z" />
        <path d="M6 6 5 3H2" />
        <circle cx="9" cy="20" r="1" />
        <circle cx="18" cy="20" r="1" />
      </svg>
      {totalQuantity > 0 ? (
        <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#c8a97e] px-1 text-[10px] font-semibold text-[#1a1a1a]">
          {totalQuantity > 99 ? "99+" : totalQuantity}
        </span>
      ) : null}
    </Link>
  );
}
