export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-dvh bg-vanilla-50 px-6 py-10 text-vanilla-900">
      <div className="mx-auto w-full max-w-md">{children}</div>
    </main>
  );
}

