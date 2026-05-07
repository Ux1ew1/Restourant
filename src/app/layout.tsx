import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Restaurant",
  description: "Сайт ресторана",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="min-h-dvh bg-vanilla-50 text-vanilla-900">{children}</body>
    </html>
  );
}

