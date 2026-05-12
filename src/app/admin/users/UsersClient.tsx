"use client";

import { useEffect, useState } from "react";

type Role = "GUEST" | "USER" | "ADMIN";

interface UserRow {
  id: string; name: string | null; email: string;
  phone: string | null; role: Role; createdAt: string;
}

const ROLE_LABELS: Record<Role, string> = { GUEST: "Гость", USER: "Пользователь", ADMIN: "Администратор" };
const ROLE_COLORS: Record<Role, string> = {
  GUEST: "bg-gray-100 text-gray-600",
  USER: "bg-blue-100 text-blue-700",
  ADMIN: "bg-vanilla-100 text-vanilla-800",
};

/**
 * Список пользователей с возможностью изменения роли.
 */
export function AdminUsersClient() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [changingId, setChangingId] = useState<string | null>(null);

  const PAGE_SIZE = 30;

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/admin/users?page=${page}`)
      .then((r) => r.json())
      .then((json: { ok: boolean; users: UserRow[]; total: number }) => {
        if (json.ok) { setUsers(json.users); setTotal(json.total); }
        setIsLoading(false);
      });
  }, [page]);

  async function changeRole(id: string, newRole: Role) {
    setChangingId(id);
    const res = await fetch(`/api/admin/users?id=${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    const json = await res.json() as { ok: boolean };
    if (json.ok) {
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, role: newRole } : u));
    }
    setChangingId(null);
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <div>
        <h1 className="font-serif text-2xl font-bold text-vanilla-900">Пользователи</h1>
        <p className="mt-0.5 text-sm text-vanilla-600">Всего: {total}</p>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-vanilla-200 bg-white">
        {isLoading ? (
          <div className="p-8 text-center text-vanilla-500">Загрузка...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-vanilla-100 bg-vanilla-50 text-left">
                <th className="px-4 py-3 font-semibold text-vanilla-700">Пользователь</th>
                <th className="px-4 py-3 font-semibold text-vanilla-700">Телефон</th>
                <th className="px-4 py-3 font-semibold text-vanilla-700">Роль</th>
                <th className="px-4 py-3 font-semibold text-vanilla-700">Дата регистрации</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-vanilla-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-vanilla-50/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-vanilla-900">{u.name ?? "—"}</p>
                    <p className="text-xs text-vanilla-500">{u.email}</p>
                  </td>
                  <td className="px-4 py-3 text-vanilla-600">{u.phone ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${ROLE_COLORS[u.role]}`}>
                      {ROLE_LABELS[u.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-vanilla-500">
                    {new Date(u.createdAt).toLocaleDateString("ru-RU")}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      disabled={changingId === u.id}
                      onChange={(e) => changeRole(u.id, e.target.value as Role)}
                      className="rounded-lg border border-vanilla-200 bg-vanilla-50 px-2 py-1 text-xs text-vanilla-700 focus:outline-none disabled:opacity-60"
                    >
                      <option value="GUEST">Гость</option>
                      <option value="USER">Пользователь</option>
                      <option value="ADMIN">Администратор</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="rounded-xl border border-vanilla-200 px-4 py-2 text-sm disabled:opacity-40">← Назад</button>
          <span className="text-sm text-vanilla-600">{page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-xl border border-vanilla-200 px-4 py-2 text-sm disabled:opacity-40">Вперёд →</button>
        </div>
      )}
    </div>
  );
}
