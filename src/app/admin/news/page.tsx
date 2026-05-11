import type { Metadata } from "next";

import { AdminNewsClient } from "./NewsClient";

export const metadata: Metadata = { title: "Новости" };

export default function AdminNewsPage() {
  return <AdminNewsClient />;
}
