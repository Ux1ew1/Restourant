import { useSession } from "next-auth/react";

/**
 * Возвращает текущего аутентифицированного пользователя из сессии NextAuth.
 *
 * На этапе 2 используется клиентская сессия `useSession()`.
 * Возвращает `null`, если пользователь не авторизован.
 */
export function useCurrentUser() {
  const { data } = useSession();
  return data?.user ?? null;
}

