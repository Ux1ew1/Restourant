"use client";

import { SessionProvider } from "next-auth/react";
import { Suspense, useEffect } from "react";

import { RouteChangeIndicator } from "@/components/layout/RouteChangeIndicator";
import { useCartStore } from "@/store/cartStore";
import { useVenueStore } from "@/store/venueStore";

function PersistedStoreHydration() {
  useEffect(() => {
    void useVenueStore.persist.rehydrate();
    void useCartStore.persist.rehydrate();
  }, []);

  return null;
}

/**
 * Клиентские провайдеры для всего приложения (сессия NextAuth и т.д.).
 */
export function AppProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <SessionProvider>
      <PersistedStoreHydration />
      <Suspense fallback={null}>
        <RouteChangeIndicator />
      </Suspense>
      {children}
    </SessionProvider>
  );
}
