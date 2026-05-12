import type { Metadata } from "next";

import { AdminOrdersFeed } from "./OrdersFeed";

export const metadata: Metadata = { title: "Заказы" };

/**
 * Главная страница административной панели — лента входящих заказов.
 */
export default function AdminOrdersPage() {
  return <AdminOrdersFeed />;
}
