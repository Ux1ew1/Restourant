import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Middleware для защиты маршрутов административной панели.
 *
 * Пропускает только пользователей с ролью ADMIN.
 * Неавторизованных или не-ADMIN перенаправляет на страницу входа.
 */
export default async function middleware(req: Request & { nextUrl: URL }) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const pathname = req.nextUrl.pathname;

  if (!pathname.startsWith("/admin")) return NextResponse.next();

  const role = token?.role;
  if (role === "ADMIN") return NextResponse.next();

  const url = new URL(req.nextUrl.toString());
  url.pathname = "/login";
  url.searchParams.set("callbackUrl", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*"],
};

