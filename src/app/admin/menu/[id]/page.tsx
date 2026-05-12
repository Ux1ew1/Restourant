import type { Metadata } from "next";

import { AdminProductEditClient } from "./ProductEditClient";

export const metadata: Metadata = { title: "Редактирование товара" };

/**
 * Страница редактирования товара по id. Добавление — отдельный маршрут `/admin/menu/new`.
 */
export default async function AdminProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminProductEditClient productId={id} />;
}
