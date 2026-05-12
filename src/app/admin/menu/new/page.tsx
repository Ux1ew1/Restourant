import type { Metadata } from "next";

import { AdminProductEditClient } from "../[id]/ProductEditClient";

export const metadata: Metadata = { title: "Добавить блюдо" };

/**
 * Отдельный маршрут создания товара (не через динамический `[id]`).
 *
 * Статический сегмент `new` обрабатывается быстрее при навигации и не конкурирует
 * с загрузкой страницы редактирования по id.
 */
export default function AdminProductNewPage() {
  return <AdminProductEditClient productId="new" />;
}
