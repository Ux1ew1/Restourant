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
    <section className="rounded-2xl border border-vanilla-200 bg-vanilla-100 p-6">
      <h1 className="text-2xl font-semibold text-vanilla-800">Вход</h1>
      <p className="mt-2 text-sm text-vanilla-700">Войдите, чтобы продолжить.</p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="text-sm font-medium text-vanilla-800" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="mt-1 w-full rounded-xl border border-vanilla-200 bg-white px-4 py-2 outline-none focus:border-vanilla-500"
            {...form.register("email")}
          />
          {form.formState.errors.email?.message ? (
            <p className="mt-1 text-sm text-red-700">{form.formState.errors.email.message}</p>
          ) : null}
        </div>

        <div>
          <label className="text-sm font-medium text-vanilla-800" htmlFor="password">
            Пароль
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="mt-1 w-full rounded-xl border border-vanilla-200 bg-white px-4 py-2 outline-none focus:border-vanilla-500"
            {...form.register("password")}
          />
          {form.formState.errors.password?.message ? (
            <p className="mt-1 text-sm text-red-700">{form.formState.errors.password.message}</p>
          ) : null}
        </div>

        {submitError ? <p className="text-sm text-red-700">{submitError}</p> : null}

        <button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full rounded-xl bg-vanilla-500 px-4 py-2 font-medium text-white hover:bg-vanilla-600 disabled:opacity-60"
        >
          {form.formState.isSubmitting ? "Входим..." : "Войти"}
        </button>
      </form>

      <p className="mt-4 text-sm text-vanilla-700">
        Нет аккаунта?{" "}
        <Link className="font-medium text-vanilla-800 underline" href="/register">
          Регистрация
        </Link>
      </p>
    </section>
  );
}

