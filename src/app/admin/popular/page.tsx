import type { Metadata } from "next";

import { AdminPopularClient } from "./PopularClient";

export const metadata: Metadata = { title: "Популярное" };

export default function AdminPopularPage() {
  return <AdminPopularClient />;
}
