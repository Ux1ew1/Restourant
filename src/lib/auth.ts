import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

/**
 * Базовая конфигурация NextAuth (Auth.js) для инициализации проекта.
 *
 * На этапе 0 провайдер Credentials подключён как "заглушка": `authorize` всегда
 * возвращает `null`. Полноценная логика входа и роли будут реализованы на этапе 2.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Пароль", type: "password" },
      },
      authorize: async () => null,
    }),
  ],
  session: { strategy: "jwt" },
});

