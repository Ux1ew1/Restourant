import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import { updateSession } from "@/utils/supabase/middleware";

const authSecret =
  process.env.AUTH_SECRET ??
  process.env.NEXTAUTH_SECRET ??
  (process.env.NODE_ENV !== "production" ? "dev-insecure-auth-secret" : undefined);

/**
 * Middleware для защиты маршрутов административной панели.
 *
 * Пропускает только пользователей с ролью ADMIN.
 * Неавторизованных или не-ADMIN перенаправляет на страницу входа.
 */
export default async function middleware(req: NextRequest) {
  const supabaseResponse = await updateSession(req);
  const token = await getToken({ req, secret: authSecret });
  const pathname = req.nextUrl.pathname;

  if (!pathname.startsWith("/admin")) return supabaseResponse;

  const role = token?.role;
  if (role === "ADMIN") return supabaseResponse;

  const url = new URL(req.nextUrl.toString());
  url.pathname = "/login";
  url.searchParams.set("callbackUrl", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
