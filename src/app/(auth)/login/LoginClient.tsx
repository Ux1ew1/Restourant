"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import type { LoginInput } from "@/lib/validations/auth.schema";
import { loginSchema } from "@/lib/validations/auth.schema";

/**
 * Клиентская часть страницы входа.
 *
 * Вынесена отдельно, чтобы `useSearchParams()` был внутри `Suspense` на уровне page.
 */
export function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = useMemo(() => searchParams.get("callbackUrl") ?? "/", [searchParams]);

  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null);
    const res = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
      callbackUrl,
    });

    if (res?.error) {
      setSubmitError("Неверный email или пароль");
      return;
    }

    router.push(res?.url ?? callbackUrl);
    router.refresh();
  });

  return (
    <section
      className="rounded-2xl border border-vanilla-300 bg-vanilla-100 px-8 py-8"
      style={{ boxShadow: "0 2px 24px rgba(92, 68, 39, 0.08)" }}
    >
      <h1 className="font-serif text-2xl font-semibold text-vanilla-900">Вход</h1>
      <p className="mt-1.5 text-sm text-vanilla-600">Войдите, чтобы продолжить.</p>

      <form className="mt-7 space-y-5" onSubmit={onSubmit}>
        <div>
          <label className="text-sm font-medium text-vanilla-700" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="mt-1.5 w-full rounded-xl border border-vanilla-300 bg-vanilla-50 px-4 py-2.5 text-sm text-vanilla-900 outline-none placeholder:text-vanilla-400 transition-colors duration-150 hover:border-vanilla-400 focus:border-vanilla-500 focus:bg-vanilla-50"
            placeholder="you@example.com"
            {...form.register("email")}
          />
          {form.formState.errors.email?.message ? (
            <p className="mt-1 text-xs text-red-700">{form.formState.errors.email.message}</p>
          ) : null}
        </div>

        <div>
          <label className="text-sm font-medium text-vanilla-700" htmlFor="password">
            Пароль
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="mt-1.5 w-full rounded-xl border border-vanilla-300 bg-vanilla-50 px-4 py-2.5 text-sm text-vanilla-900 outline-none placeholder:text-vanilla-400 transition-colors duration-150 hover:border-vanilla-400 focus:border-vanilla-500 focus:bg-vanilla-50"
            placeholder="••••••••"
            {...form.register("password")}
          />
          {form.formState.errors.password?.message ? (
            <p className="mt-1 text-xs text-red-700">{form.formState.errors.password.message}</p>
          ) : null}
        </div>

        {submitError ? (
          <p className="rounded-lg border border-vanilla-300 bg-vanilla-200 px-3 py-2 text-sm text-red-700">
            {submitError}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="mt-1 w-full rounded-xl bg-vanilla-800 px-4 py-2.5 text-sm font-semibold text-vanilla-50 transition-colors duration-150 hover:bg-vanilla-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {form.formState.isSubmitting ? "Входим…" : "Войти"}
        </button>
      </form>

      <div className="mt-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-vanilla-300" />
      </div>

      <p className="mt-5 text-center text-sm text-vanilla-600">
        Нет аккаунта?{" "}
        <Link
          className="font-medium text-vanilla-800 underline decoration-vanilla-400 underline-offset-2 hover:text-vanilla-900"
          href="/register"
        >
          Регистрация
        </Link>
      </p>
    </section>
  );
}
