"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { pickupSchema, type PickupFormData } from "@/lib/validations/checkout.schema";
import { formatPriceFromKopecks } from "@/lib/utils";

/** Пропсы компонента PickupForm */
interface PickupFormProps {
  /** Адрес точки самовывоза — отображается клиенту для информации */
  venueAddress?: string;
  /** Сумма заказа в копейках — для подсказки в поле «Сдача с...» */
  totalKopecks: number;
  /** Предзаполненный номер телефона из профиля пользователя */
  defaultPhone?: string;
  /** Вызывается при успешной отправке формы */
  onSubmit: (data: PickupFormData) => void;
  /** Форма заблокирована (идёт создание заказа) */
  isSubmitting?: boolean;
}

/**
 * Форма оформления самовывоза.
 *
 * Показывает адрес точки самовывоза, поля контакта и времени получения.
 * Поле «Сдача с...» отображается только при оплате наличными.
 * Поле «Желаемое время» появляется при выборе «Выбрать время».
 *
 * @param venueAddress - Адрес заведения
 * @param totalKopecks - Сумма заказа в копейках
 * @param defaultPhone - Предзаполненный телефон
 * @param onSubmit - Колбэк с данными формы
 * @param isSubmitting - Блокировка при отправке
 */
export function PickupForm({
  venueAddress,
  totalKopecks,
  defaultPhone = "",
  onSubmit,
  isSubmitting = false,
}: PickupFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PickupFormData>({
    resolver: zodResolver(pickupSchema),
    defaultValues: {
      type: "pickup",
      phone: defaultPhone,
      deliveryTimeType: "nearest",
      paymentMethod: "card",
    },
  });

  const paymentMethod = watch("paymentMethod");
  const deliveryTimeType = watch("deliveryTimeType");

  useEffect(() => {
    if (defaultPhone) setValue("phone", defaultPhone);
  }, [defaultPhone, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <input type="hidden" {...register("type")} />

      {/* Адрес точки самовывоза */}
      {venueAddress && (
        <div className="rounded-xl border border-vanilla-200 bg-vanilla-100 px-4 py-3">
          <p className="text-xs font-medium text-vanilla-600">Адрес самовывоза</p>
          <p className="mt-0.5 text-sm font-semibold text-vanilla-900">{venueAddress}</p>
        </div>
      )}

      {/* Телефон */}
      <div>
        <label className="mb-1 block text-xs font-medium text-vanilla-700">
          Номер телефона <span className="text-red-500">*</span>
        </label>
        <input
          {...register("phone")}
          type="tel"
          placeholder="+7 (900) 000-00-00"
          className="w-full rounded-xl border border-vanilla-200 bg-vanilla-50 px-4 py-2.5 text-sm text-vanilla-900 placeholder:text-vanilla-400 focus:border-vanilla-500 focus:outline-none focus:ring-2 focus:ring-vanilla-500/20"
        />
        {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
      </div>

      {/* Время получения */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-vanilla-800">Время получения</legend>
        <div className="flex overflow-hidden rounded-xl border border-vanilla-200">
          <button
            type="button"
            onClick={() => setValue("deliveryTimeType", "nearest")}
            className={`flex-1 py-2.5 text-xs font-medium transition ${
              deliveryTimeType === "nearest"
                ? "bg-vanilla-500 text-white"
                : "bg-vanilla-50 text-vanilla-600 hover:bg-vanilla-100"
            }`}
          >
            Ближайшее
          </button>
          <button
            type="button"
            onClick={() => setValue("deliveryTimeType", "scheduled")}
            className={`flex-1 py-2.5 text-xs font-medium transition ${
              deliveryTimeType === "scheduled"
                ? "bg-vanilla-500 text-white"
                : "bg-vanilla-50 text-vanilla-600 hover:bg-vanilla-100"
            }`}
          >
            Выбрать время
          </button>
        </div>
        {deliveryTimeType === "scheduled" && (
          <div>
            <input
              {...register("scheduledTime")}
              type="datetime-local"
              className="w-full rounded-xl border border-vanilla-200 bg-vanilla-50 px-4 py-2.5 text-sm text-vanilla-900 focus:border-vanilla-500 focus:outline-none focus:ring-2 focus:ring-vanilla-500/20"
            />
            {errors.scheduledTime && (
              <p className="mt-1 text-xs text-red-500">{errors.scheduledTime.message}</p>
            )}
          </div>
        )}
      </fieldset>

      {/* Способ оплаты */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-vanilla-800">Способ оплаты</legend>
        <div className="flex overflow-hidden rounded-xl border border-vanilla-200">
          <button
            type="button"
            onClick={() => setValue("paymentMethod", "card")}
            className={`flex-1 py-2.5 text-xs font-medium transition ${
              paymentMethod === "card"
                ? "bg-vanilla-500 text-white"
                : "bg-vanilla-50 text-vanilla-600 hover:bg-vanilla-100"
            }`}
          >
            Картой
          </button>
          <button
            type="button"
            onClick={() => setValue("paymentMethod", "cash")}
            className={`flex-1 py-2.5 text-xs font-medium transition ${
              paymentMethod === "cash"
                ? "bg-vanilla-500 text-white"
                : "bg-vanilla-50 text-vanilla-600 hover:bg-vanilla-100"
            }`}
          >
            Наличными
          </button>
        </div>
        {errors.paymentMethod && (
          <p className="mt-1 text-xs text-red-500">{errors.paymentMethod.message}</p>
        )}

        {paymentMethod === "cash" && (
          <div>
            <label className="mb-1 block text-xs font-medium text-vanilla-700">
              Сдача с (₽){" "}
              <span className="text-vanilla-500">
                — заказ на {formatPriceFromKopecks(totalKopecks)}
              </span>
            </label>
            <input
              {...register("changeFrom")}
              type="number"
              min="0"
              placeholder="Например, 1000"
              className="w-full rounded-xl border border-vanilla-200 bg-vanilla-50 px-4 py-2.5 text-sm text-vanilla-900 placeholder:text-vanilla-400 focus:border-vanilla-500 focus:outline-none focus:ring-2 focus:ring-vanilla-500/20"
            />
          </div>
        )}
      </fieldset>

      {/* Комментарий */}
      <div>
        <label className="mb-1 block text-xs font-medium text-vanilla-700">
          Дополнительная информация
        </label>
        <textarea
          {...register("comment")}
          rows={3}
          placeholder="Пожелания к заказу..."
          className="w-full resize-none rounded-xl border border-vanilla-200 bg-vanilla-50 px-4 py-2.5 text-sm text-vanilla-900 placeholder:text-vanilla-400 focus:border-vanilla-500 focus:outline-none focus:ring-2 focus:ring-vanilla-500/20"
        />
        {errors.comment && <p className="mt-1 text-xs text-red-500">{errors.comment.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-vanilla-500 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-vanilla-400 disabled:opacity-60"
      >
        {isSubmitting ? "Оформляем заказ..." : "Оформить заказ"}
      </button>
    </form>
  );
}
