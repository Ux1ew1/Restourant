import { Suspense } from "react";

import { LoginClient } from "./LoginClient";

/**
 * Страница входа пользователя (email + пароль).
 *
 * После успешного входа перенаправляет на `callbackUrl` (если задан) или на `/`.
 */
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <section className="rounded-2xl border border-vanilla-200 bg-vanilla-100 p-6">
          <h1 className="text-2xl font-semibold text-vanilla-800">Вход</h1>
          <p className="mt-2 text-sm text-vanilla-700">Загружаем...</p>
        </section>
      }
    >
      <LoginClient />
    </Suspense>
  );
}

