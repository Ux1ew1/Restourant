import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";

import { AppProviders } from "./providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  variable: "--font-serif",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

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
    <html lang="ru" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-dvh bg-vanilla-50 font-sans text-vanilla-900 antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

