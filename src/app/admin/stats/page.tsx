import type { Metadata } from "next";

import { AdminStatsClient } from "./StatsClient";

export const metadata: Metadata = { title: "Статистика" };

export default function AdminStatsPage() {
  return <AdminStatsClient />;
}
