import type { Metadata } from "next";

import { AdminUsersClient } from "./UsersClient";

export const metadata: Metadata = { title: "Пользователи" };

export default function AdminUsersPage() {
  return <AdminUsersClient />;
}
