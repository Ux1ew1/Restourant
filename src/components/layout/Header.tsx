"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

import { useCart } from "@/hooks/useCart";
import { useVenue } from "@/hooks/useVenue";

/**
 * Шапка сайта: логотип/заведение, навигация, адрес, авторизация, корзина, мобильное меню.
 */
export function Header() {
  const { selectedVenue, selectedCity, openVenuePicker } = useVenue();
  const { totalQuantity } = useCart();
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const logoSrc = selectedVenue?.logoUrl || "/images/placeholder/venue-placeholder.svg";
  const venueTitle = selectedVenue?.name ?? "Выберите заведение";
  const address = selectedVenue?.address ?? "Адрес появится после выбора точки";

  return (
    <header className="sticky top-0 z-40 border-b border-vanilla-200 bg-vanilla-50/90 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Link
            href="/"
            className="relative h-10 w-10 shrink-0 overflow-hidden rounded-2xl border border-vanilla-200 bg-vanilla-100"
            aria-label="На главную"
          >
            <Image
              src={logoSrc}
              alt=""
              fill
              className="object-cover"
              sizes="40px"
            />
          </Link>

          <button
            type="button"
            onClick={() => openVenuePicker(selectedCity ? "venue" : "city")}
            className="min-w-0 rounded-xl px-1 text-left transition hover:bg-vanilla-100/80"
          >
            <div className="truncate text-sm font-semibold text-vanilla-900">{venueTitle}</div>
            <div className="text-xs text-vanilla-500">Сменить заведение</div>
          </button>
        </div>

        <nav className="hidden items-center gap-5 md:flex" aria-label="Основная навигация">
          <Link
            href="/"
            className="text-sm font-medium text-vanilla-800 transition hover:text-vanilla-600"
          >
            Главная
          </Link>
          <Link
            href="/menu"
            className="text-sm font-medium text-vanilla-800 transition hover:text-vanilla-600"
          >
            Меню
          </Link>
          <Link
            href="/#contacts"
            className="text-sm font-medium text-vanilla-800 transition hover:text-vanilla-600"
          >
            Контакты
          </Link>
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <p className="max-w-[220px] truncate text-right text-sm text-vanilla-700" title={address}>
            {address}
          </p>

          <div className="flex items-center gap-2 border-l border-vanilla-200 pl-4">
            {status === "loading" ? (
              <span className="text-sm text-vanilla-500">…</span>
            ) : session?.user ? (
              <div className="flex flex-col items-end text-right text-sm">
                <span className="font-medium text-vanilla-900">
                  {session.user.name || session.user.email}
                </span>
                {session.user.phone ? (
                  <span className="text-xs text-vanilla-600">{session.user.phone}</span>
                ) : null}
                <button
                  type="button"
                  className="mt-1 text-xs font-medium text-vanilla-700 underline decoration-vanilla-400 underline-offset-2 hover:text-vanilla-900"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Выйти
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm">
                <Link
                  href="/login"
                  className="rounded-xl px-3 py-1.5 font-medium text-vanilla-800 hover:bg-vanilla-100"
                >
                  Войти
                </Link>
                <Link
                  href="/register"
                  className="rounded-xl bg-vanilla-500 px-3 py-1.5 font-medium text-white hover:bg-vanilla-600"
                >
                  Регистрация
                </Link>
              </div>
            )}
          </div>

          <Link
            href="/cart"
            className="relative rounded-xl border border-vanilla-200 bg-white p-2 text-vanilla-900 shadow-sm transition hover:border-vanilla-300 hover:bg-vanilla-100"
            aria-label={`Корзина, позиций: ${totalQuantity}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              className="h-5 w-5"
              aria-hidden
            >
              <path d="M6 6h15l-1.5 9h-12z" />
              <path d="M6 6 5 3H2" />
              <circle cx="9" cy="20" r="1" />
              <circle cx="18" cy="20" r="1" />
            </svg>
            {totalQuantity > 0 ? (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-vanilla-600 px-1 text-[10px] font-semibold text-white">
                {totalQuantity > 99 ? "99+" : totalQuantity}
              </span>
            ) : null}
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/cart"
            className="relative rounded-xl border border-vanilla-200 bg-white p-2"
            aria-label={`Корзина, позиций: ${totalQuantity}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              className="h-5 w-5"
            >
              <path d="M6 6h15l-1.5 9h-12z" />
              <path d="M6 6 5 3H2" />
              <circle cx="9" cy="20" r="1" />
              <circle cx="18" cy="20" r="1" />
            </svg>
            {totalQuantity > 0 ? (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-vanilla-600 px-1 text-[9px] font-semibold text-white">
                {totalQuantity > 99 ? "99+" : totalQuantity}
              </span>
            ) : null}
          </Link>

          <button
            type="button"
            className="rounded-xl border border-vanilla-200 bg-white p-2 text-vanilla-900 transition hover:bg-vanilla-100"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? "Закрыть меню" : "Открыть меню"}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                className="h-5 w-5"
                aria-hidden
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                className="h-5 w-5"
                aria-hidden
              >
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
            className="overflow-hidden border-t border-vanilla-200 bg-vanilla-50 md:hidden"
          >
            <div className="space-y-3 px-4 py-4">
              <p className="text-sm text-vanilla-700">{address}</p>
              <div className="flex flex-col gap-2">
                <Link
                  href="/"
                  className="rounded-xl py-2 text-sm font-medium text-vanilla-900"
                  onClick={() => setMobileOpen(false)}
                >
                  Главная
                </Link>
                <Link
                  href="/menu"
                  className="rounded-xl py-2 text-sm font-medium text-vanilla-900"
                  onClick={() => setMobileOpen(false)}
                >
                  Меню
                </Link>
                <Link
                  href="/#contacts"
                  className="rounded-xl py-2 text-sm font-medium text-vanilla-900"
                  onClick={() => setMobileOpen(false)}
                >
                  Контакты
                </Link>
              </div>
              {status === "loading" ? (
                <p className="text-sm text-vanilla-500">Загрузка…</p>
              ) : session?.user ? (
                <div className="space-y-2 border-t border-vanilla-200 pt-3">
                  <p className="text-sm font-medium text-vanilla-900">
                    {session.user.name || session.user.email}
                  </p>
                  {session.user.phone ? (
                    <p className="text-sm text-vanilla-700">{session.user.phone}</p>
                  ) : null}
                  <button
                    type="button"
                    className="text-sm font-medium text-vanilla-800 underline"
                    onClick={() => {
                      setMobileOpen(false);
                      void signOut({ callbackUrl: "/" });
                    }}
                  >
                    Выйти
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 border-t border-vanilla-200 pt-3">
                  <Link
                    href="/login"
                    className="rounded-xl border border-vanilla-200 py-2 text-center text-sm font-medium"
                    onClick={() => setMobileOpen(false)}
                  >
                    Войти
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-xl bg-vanilla-500 py-2 text-center text-sm font-medium text-white"
                    onClick={() => setMobileOpen(false)}
                  >
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
