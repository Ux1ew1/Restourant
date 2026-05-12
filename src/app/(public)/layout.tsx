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
      <main className="w-full flex-1">{children}</main>
      <Footer />
    </div>
  );
}
