import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { VenuePickerHost } from "@/components/layout/VenuePickerHost";

/**
 * Публичная зона: общая шапка, подвал и глобальный выбор города/заведения.
 */
export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <VenuePickerHost />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>
      <Footer />
    </div>
  );
}
