import type { Metadata } from "next";

import { AdminDashboardLayout } from "@/components/layout/AdminDashboardLayout";

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
  return <AdminDashboardLayout>{children}</AdminDashboardLayout>;
}
