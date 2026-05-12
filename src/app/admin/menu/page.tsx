import type { Metadata } from "next";

import { AdminMenuClient } from "./MenuClient";

export const metadata: Metadata = { title: "Меню" };

/**
 * Страница управления товарами меню.
 */
export default function AdminMenuPage() {
  return <AdminMenuClient />;
}
