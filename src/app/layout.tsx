import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";

import { DEFAULT_OG_IMAGE, SITE_NAME, absoluteUrl, getSiteUrl } from "@/lib/seo";

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
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: "Сайт ресторана с онлайн-меню, доставкой и самовывозом.",
  openGraph: {
    title: SITE_NAME,
    description: "Онлайн-меню ресторана, доставка и самовывоз.",
    url: getSiteUrl(),
    siteName: SITE_NAME,
    locale: "ru_RU",
    type: "website",
    images: [
      {
        url: absoluteUrl(DEFAULT_OG_IMAGE),
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: "Онлайн-меню ресторана, доставка и самовывоз.",
    images: [absoluteUrl(DEFAULT_OG_IMAGE)],
  },
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
