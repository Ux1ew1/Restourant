import type { Metadata } from "next";

import { AdminCategoriesClient } from "./CategoriesClient";

export const metadata: Metadata = { title: "Категории" };

export default function AdminCategoriesPage() {
  return <AdminCategoriesClient />;
}
