"use client";

import { SessionProvider } from "next-auth/react";

/**
 * Клиентские провайдеры для всего приложения (сессия NextAuth и т.д.).
 */
export function AppProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  return <SessionProvider>{children}</SessionProvider>;
}
