import Link from "next/link";

/**
 * Подвал сайта: контакты и вспомогательные ссылки.
 */
export function Footer() {
  return (
    <footer id="contacts" className="mt-auto border-t border-vanilla-200 bg-vanilla-100 text-vanilla-900">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <span className="font-serif text-xl font-semibold tracking-tight text-vanilla-900">
              Restaurant
            </span>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-vanilla-600">
              Доставка и самовывоз — уточняйте в выбранной точке.
            </p>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-vanilla-400">
              Контакты
            </h2>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a
                  className="text-vanilla-700 transition hover:text-vanilla-900"
                  href="tel:+74950000000"
                >
                  +7 (495) 000-00-00
                </a>
              </li>
              <li>
                <a
                  className="text-vanilla-700 transition hover:text-vanilla-900"
                  href="mailto:hello@example.com"
                >
                  hello@example.com
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-vanilla-400">
              Навигация
            </h2>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/" className="text-vanilla-700 transition hover:text-vanilla-900">
                  Главная
                </Link>
              </li>
              <li>
                <Link href="/menu" className="text-vanilla-700 transition hover:text-vanilla-900">
                  Меню
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-vanilla-700 transition hover:text-vanilla-900">
                  Корзина
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-vanilla-700 transition hover:text-vanilla-900">
                  Войти
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-vanilla-200 px-4 py-5 text-center text-xs text-vanilla-400 sm:px-6">
        © {new Date().getFullYear()} Restaurant — все права защищены
      </div>
    </footer>
  );
}
