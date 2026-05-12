"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { deliverySchema, type DeliveryFormData } from "@/lib/validations/checkout.schema";
import { formatPriceFromKopecks } from "@/lib/utils";

/** Пропсы компонента DeliveryForm */
interface DeliveryFormProps {
  /** Сумма заказа в копейках — для подсказки в поле «Сдача с...» */
  totalKopecks: number;
  /** Предзаполненный номер телефона из профиля пользователя */
  defaultPhone?: string;
  /** Вызывается при успешной отправке формы */
  onSubmit: (data: DeliveryFormData) => void;
  /** Форма заблокирована (идёт создание заказа) */
  isSubmitting?: boolean;
}

/**
 * Форма оформления доставки.
 *
 * Содержит поля адреса с переключателем «Квартира / Частный дом» —
 * при выборе квартиры появляются поля «Квартира» и «Домофон».
 * Поле «Сдача с...» отображается только при оплате наличными.
 * Поле «Желаемое время» появляется при выборе «Выбрать время».
 *
 * @param totalKopecks - Сумма заказа в копейках
 * @param defaultPhone - Предзаполненный телефон
 * @param onSubmit - Колбэк с данными формы
 * @param isSubmitting - Блокировка при отправке
 */
export function DeliveryForm({
  totalKopecks,
  defaultPhone = "",
  onSubmit,
  isSubmitting = false,
}: DeliveryFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DeliveryFormData>({
    resolver: zodResolver(deliverySchema),
    defaultValues: {
      type: "delivery",
      phone: defaultPhone,
      buildingType: "apartment",
      deliveryTimeType: "nearest",
      paymentMethod: "card",
    },
  });

  const buildingType = watch("buildingType");
  const paymentMethod = watch("paymentMethod");
  const deliveryTimeType = watch("deliveryTimeType");

  useEffect(() => {
    if (defaultPhone) setValue("phone", defaultPhone);
  }, [defaultPhone, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <input type="hidden" {...register("type")} />

      {/* Адрес */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-vanilla-800">Адрес доставки</legend>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="mb-1 block text-xs font-medium text-vanilla-700">
              Улица <span className="text-red-500">*</span>
            </label>
            <input
              {...register("street")}
              placeholder="Например, ул. Ленина"
              className="w-full rounded-xl border border-vanilla-200 bg-vanilla-50 px-4 py-2.5 text-sm text-vanilla-900 placeholder:text-vanilla-400 focus:border-vanilla-500 focus:outline-none focus:ring-2 focus:ring-vanilla-500/20"
            />
            {errors.street && (
              <p className="mt-1 text-xs text-red-500">{errors.street.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-vanilla-700">
              Дом <span className="text-red-500">*</span>
            </label>
            <input
              {...register("house")}
              placeholder="1А"
              className="w-full rounded-xl border border-vanilla-200 bg-vanilla-50 px-4 py-2.5 text-sm text-vanilla-900 placeholder:text-vanilla-400 focus:border-vanilla-500 focus:outline-none focus:ring-2 focus:ring-vanilla-500/20"
            />
            {errors.house && (
              <p className="mt-1 text-xs text-red-500">{errors.house.message}</p>
            )}
          </div>

          {/* Тип здания */}
          <div className="flex items-end pb-0.5">
            <div className="flex w-full overflow-hidden rounded-xl border border-vanilla-200">
              <button
                type="button"
                onClick={() => setValue("buildingType", "apartment")}
                className={`flex-1 py-2.5 text-xs font-medium transition ${
                  buildingType === "apartment"
                    ? "bg-vanilla-500 text-white"
                    : "bg-vanilla-50 text-vanilla-600 hover:bg-vanilla-100"
                }`}
              >
                Квартира
              </button>
              <button
                type="button"
                onClick={() => setValue("buildingType", "private")}
                className={`flex-1 py-2.5 text-xs font-medium transition ${
                  buildingType === "private"
                    ? "bg-vanilla-500 text-white"
                    : "bg-vanilla-50 text-vanilla-600 hover:bg-vanilla-100"
                }`}
              >
                Частный дом
              </button>
            </div>
          </div>
        </div>

        {/* Поля для квартиры */}
        {buildingType === "apartment" && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-vanilla-700">Квартира</label>
              <input
                {...register("flat")}
                placeholder="42"
                className="w-full rounded-xl border border-vanilla-200 bg-vanilla-50 px-4 py-2.5 text-sm text-vanilla-900 placeholder:text-vanilla-400 focus:border-vanilla-500 focus:outline-none focus:ring-2 focus:ring-vanilla-500/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-vanilla-700">Домофон</label>
              <input
                {...register("intercom")}
                placeholder="42К"
                className="w-full rounded-xl border border-vanilla-200 bg-vanilla-50 px-4 py-2.5 text-sm text-vanilla-900 placeholder:text-vanilla-400 focus:border-vanilla-500 focus:outline-none focus:ring-2 focus:ring-vanilla-500/20"
              />
            </div>
          </div>
        )}
      </fieldset>

      {/* Контакт */}
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

      {/* Время доставки */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-vanilla-800">Время доставки</legend>
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
          placeholder="Подъезд, ориентиры, пожелания..."
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
