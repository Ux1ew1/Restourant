import Link from "next/link";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-vanilla-200 px-6 py-12">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block focus-visible:rounded-lg">
            <span className="font-serif text-3xl font-semibold tracking-tight text-vanilla-900">
              Restaurant
            </span>
          </Link>
          <p className="mt-2 text-sm text-vanilla-600">Вкусная еда рядом с вами</p>
        </div>

        {/* Декоративный разделитель */}
        <div className="mb-8 flex items-center gap-3">
          <div className="h-px flex-1 bg-vanilla-300" />
          <span className="text-xs text-vanilla-400">◆</span>
          <div className="h-px flex-1 bg-vanilla-300" />
        </div>

        {children}
      </div>
    </div>
  );
}
