"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import type { RegisterInput } from "@/lib/validations/auth.schema";
import { registerSchema } from "@/lib/validations/auth.schema";

/**
 * Страница регистрации пользователя.
 *
 * Создаёт пользователя через `POST /api/auth/register`, затем выполняет вход
 * через Credentials и перенаправляет на главную.
 */
export default function RegisterPage() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", phone: "", password: "" },
    mode: "onSubmit",
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values),
    });

    if (res.status === 409) {
      setSubmitError("Этот email уже зарегистрирован");
      return;
    }

    if (!res.ok) {
      setSubmitError("Не удалось зарегистрироваться. Попробуйте ещё раз.");
      return;
    }

    const signInRes = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
      callbackUrl: "/",
    });

    if (signInRes?.error) {
      router.push("/login");
      return;
    }

    router.push(signInRes?.url ?? "/");
    router.refresh();
  });

  return (
    <section
      className="rounded-2xl border border-vanilla-300 bg-vanilla-100 px-8 py-8"
      style={{ boxShadow: "0 2px 24px rgba(92, 68, 39, 0.08)" }}
    >
      <h1 className="font-serif text-2xl font-semibold text-vanilla-900">Регистрация</h1>
      <p className="mt-1.5 text-sm text-vanilla-600">Создайте аккаунт за минуту.</p>

      <form className="mt-7 space-y-5" onSubmit={onSubmit}>
        <div>
          <label className="text-sm font-medium text-vanilla-700" htmlFor="name">
            Имя{" "}
            <span className="font-normal text-vanilla-400">(необязательно)</span>
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            className="mt-1.5 w-full rounded-xl border border-vanilla-300 bg-vanilla-50 px-4 py-2.5 text-sm text-vanilla-900 outline-none placeholder:text-vanilla-400 transition-colors duration-150 hover:border-vanilla-400 focus:border-vanilla-500 focus:bg-vanilla-50"
            placeholder="Иван"
            {...form.register("name")}
          />
          {form.formState.errors.name?.message ? (
            <p className="mt-1 text-xs text-red-700">{form.formState.errors.name.message}</p>
          ) : null}
        </div>

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
          <label className="text-sm font-medium text-vanilla-700" htmlFor="phone">
            Телефон{" "}
            <span className="font-normal text-vanilla-400">(необязательно)</span>
          </label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            className="mt-1.5 w-full rounded-xl border border-vanilla-300 bg-vanilla-50 px-4 py-2.5 text-sm text-vanilla-900 outline-none placeholder:text-vanilla-400 transition-colors duration-150 hover:border-vanilla-400 focus:border-vanilla-500 focus:bg-vanilla-50"
            placeholder="+7 (999) 000-00-00"
            {...form.register("phone")}
          />
          {form.formState.errors.phone?.message ? (
            <p className="mt-1 text-xs text-red-700">{form.formState.errors.phone.message}</p>
          ) : null}
        </div>

        <div>
          <label className="text-sm font-medium text-vanilla-700" htmlFor="password">
            Пароль
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
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
          {form.formState.isSubmitting ? "Создаём аккаунт…" : "Создать аккаунт"}
        </button>
      </form>

      <div className="mt-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-vanilla-300" />
      </div>

      <p className="mt-5 text-center text-sm text-vanilla-600">
        Уже есть аккаунт?{" "}
        <Link
          className="font-medium text-vanilla-800 underline decoration-vanilla-400 underline-offset-2 hover:text-vanilla-900"
          href="/login"
        >
          Войти
        </Link>
      </p>
    </section>
  );
}
