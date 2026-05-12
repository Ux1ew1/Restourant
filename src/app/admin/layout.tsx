import type { Metadata } from "next";

import { AdminSidebar } from "@/components/layout/AdminSidebar";

export const metadata: Metadata = {
  title: {
    template: "%s — Админ-панель",
    default: "Админ-панель",
  },
};

/**
 * Layout административной панели.
 *
 * Маршрут уже защищён middleware (`src/middleware.ts`) — сюда попадают только ADMIN.
 * Отображает боковую панель и основной контент.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-vanilla-50">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
