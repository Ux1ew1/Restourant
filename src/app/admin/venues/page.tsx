import type { Metadata } from "next";

import { AdminVenuesClient } from "./VenuesClient";

export const metadata: Metadata = { title: "Заведения" };

export default function AdminVenuesPage() {
  return <AdminVenuesClient />;
}
