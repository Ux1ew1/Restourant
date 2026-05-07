import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

/**
 * Конфигурация NextAuth (Auth.js) для аутентификации через Credentials.
 *
 * Используется email + пароль. Пароль сверяется с `passwordHash` в базе (bcrypt).
 * Сессия JWT расширяется полями `id`, `role`, `phone`, чтобы их можно было
 * использовать на клиенте и в middleware.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Пароль", type: "password" },
      },
      authorize: async (credentials) => {
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            role: true,
            passwordHash: true,
          },
        });

        if (!user) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: "GUEST" | "USER" | "ADMIN" }).role;
        token.phone = (user as { phone?: string | null }).phone;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "GUEST" | "USER" | "ADMIN";
        session.user.phone = token.phone as string | null | undefined;
      }
      return session;
    },
  },
});

