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
    <section className="rounded-2xl border border-vanilla-200 bg-vanilla-100 p-6">
      <h1 className="text-2xl font-semibold text-vanilla-800">Регистрация</h1>
      <p className="mt-2 text-sm text-vanilla-700">Создайте аккаунт за минуту.</p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="text-sm font-medium text-vanilla-800" htmlFor="name">
            Имя (необязательно)
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            className="mt-1 w-full rounded-xl border border-vanilla-200 bg-white px-4 py-2 outline-none focus:border-vanilla-500"
            {...form.register("name")}
          />
          {form.formState.errors.name?.message ? (
            <p className="mt-1 text-sm text-red-700">{form.formState.errors.name.message}</p>
          ) : null}
        </div>

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
          <label className="text-sm font-medium text-vanilla-800" htmlFor="phone">
            Телефон (необязательно)
          </label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            className="mt-1 w-full rounded-xl border border-vanilla-200 bg-white px-4 py-2 outline-none focus:border-vanilla-500"
            {...form.register("phone")}
          />
          {form.formState.errors.phone?.message ? (
            <p className="mt-1 text-sm text-red-700">{form.formState.errors.phone.message}</p>
          ) : null}
        </div>

        <div>
          <label className="text-sm font-medium text-vanilla-800" htmlFor="password">
            Пароль
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
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
          {form.formState.isSubmitting ? "Регистрируем..." : "Создать аккаунт"}
        </button>
      </form>

      <p className="mt-4 text-sm text-vanilla-700">
        Уже есть аккаунт?{" "}
        <Link className="font-medium text-vanilla-800 underline" href="/login">
          Войти
        </Link>
      </p>
    </section>
  );
}

