import { z } from "zod";

/**
 * Валидация российского номера телефона.
 * Принимает форматы +7..., 8..., 7... с разными разделителями.
 */
const phoneSchema = z
  .string()
  .trim()
  .min(10, "Введите номер телефона")
  .max(20, "Некорректный номер телефона")
  .regex(/^[\d\s\+\-\(\)]+$/, "Некорректный номер телефона");

/**
 * Общие поля для обеих форм оформления заказа.
 */
const baseFields = {
  phone: phoneSchema,
  /** Способ оплаты */
  paymentMethod: z.enum(["card", "cash"], { message: "Выберите способ оплаты" }),
  /** Сдача с (в рублях). Заполняется только при оплате наличными */
  changeFrom: z.coerce.number().int().min(0).optional(),
  /** Время доставки/выдачи */
  deliveryTimeType: z.enum(["nearest", "scheduled"], { message: "Выберите время" }),
  /** Конкретное время (ISO-строка) при выборе «выбрать время» */
  scheduledTime: z.string().optional(),
  /** Дополнительная информация / комментарий */
  comment: z.string().trim().max(500, "Комментарий слишком длинный").optional(),
};

/**
 * Схема формы самовывоза.
 */
export const pickupSchema = z
  .object({
    type: z.literal("pickup"),
    ...baseFields,
  })
  .superRefine((data, ctx) => {
    if (data.paymentMethod === "cash" && (!data.changeFrom || data.changeFrom === 0)) {
      // changeFrom необязательно при наличных, но если есть — должно быть > суммы заказа (проверяется на UI)
    }
    if (data.deliveryTimeType === "scheduled" && !data.scheduledTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["scheduledTime"],
        message: "Укажите желаемое время",
      });
    }
  });

/**
 * Схема формы доставки.
 *
 * Включает адрес с возможностью переключения тип здания: квартира / частный дом.
 * Поля `flat` и `intercom` показываются только при `buildingType === "apartment"`.
 */
export const deliverySchema = z
  .object({
    type: z.literal("delivery"),
    street: z.string().trim().min(1, "Введите улицу"),
    house: z.string().trim().min(1, "Введите номер дома"),
    /** Тип здания: квартира или частный дом */
    buildingType: z.enum(["apartment", "private"]),
    /** Номер квартиры (только для квартиры) */
    flat: z.string().trim().max(10).optional(),
    /** Код домофона (только для квартиры) */
    intercom: z.string().trim().max(20).optional(),
    ...baseFields,
  })
  .superRefine((data, ctx) => {
    if (data.deliveryTimeType === "scheduled" && !data.scheduledTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["scheduledTime"],
        message: "Укажите желаемое время",
      });
    }
  });

/** Объединённая схема оформления заказа (discriminated union по полю `type`) */
export const checkoutSchema = z.discriminatedUnion("type", [pickupSchema, deliverySchema]);

export type PickupFormData = z.infer<typeof pickupSchema>;
export type DeliveryFormData = z.infer<typeof deliverySchema>;
export type CheckoutFormData = z.infer<typeof checkoutSchema>;
