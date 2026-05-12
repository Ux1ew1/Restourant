import { z } from "zod";

import { imageUrlSchema } from "@/lib/validations/image-url";

/**
 * Zod-схема формы создания/редактирования товара в административной панели.
 */
export const productSchema = z.object({
  name: z.string().trim().min(1, "Введите название").max(200, "Слишком длинное название"),
  slug: z
    .string()
    .trim()
    .min(1, "Укажите адрес в ссылке")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Только строчные латинские буквы, цифры и дефисы"),
  description: z.string().trim().max(1000, "Слишком длинное описание").optional(),
  imageUrl: imageUrlSchema("Некорректный URL изображения").optional().or(z.literal("")),
  weight: z.string().trim().max(50, "Слишком длинное значение").optional(),
  composition: z.string().trim().max(500, "Слишком длинный состав").optional(),
  /** Цена в рублях (целое число). На сервере конвертируется в копейки умножением × 100 */
  price: z.coerce
    .number({ message: "Введите цену" })
    .int("Цена должна быть целым числом рублей")
    .min(1, "Цена должна быть больше 0"),
  categoryId: z.string().min(1, "Выберите категорию"),
  isHidden: z.boolean().optional(),
  isStopList: z.boolean().optional(),
});

export type ProductFormInput = z.input<typeof productSchema>;
export type ProductFormData = z.output<typeof productSchema>;
