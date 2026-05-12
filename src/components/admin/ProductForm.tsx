"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { slugFromTitle } from "@/lib/slugFromTitle";
import { uploadAdminImage } from "@/lib/admin-image-upload";
import {
  productSchema,
  type ProductFormData,
  type ProductFormInput,
} from "@/lib/validations/product.schema";

interface Category {
  id: string;
  name: string;
}

/** Пропсы компонента ProductForm */
interface ProductFormProps {
  /** Категории для выбора в селекте */
  categories: Category[];
  /** Начальные данные для редактирования (если не передан — форма создания) */
  defaultValues?: Partial<ProductFormData>;
  /** Вызывается при сабмите с валидными данными */
  onSubmit: (data: ProductFormData) => void;
  /** Форма заблокирована */
  isSubmitting?: boolean;
  /** Текст кнопки сабмита */
  submitLabel?: string;
}

/**
 * Форма добавления / редактирования товара.
 *
 * Поле «цена» принимает значение в рублях; конвертация в копейки выполняется в API-маршруте.
 * Автогенерация адреса в ссылке из названия — кнопка «Авто» рядом с полем.
 *
 * @param categories - Список категорий заведения
 * @param defaultValues - Предзаполненные значения для редактирования
 * @param onSubmit - Колбэк при успешной отправке
 * @param isSubmitting - Блокировка кнопки
 * @param submitLabel - Текст кнопки
 */
export function ProductForm({
  categories,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  submitLabel = "Сохранить",
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormInput, unknown, ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      isHidden: false,
      isStopList: false,
      ...defaultValues,
    },
  });

  // При редактировании сбрасываем на новые defaultValues
  useEffect(() => {
    if (defaultValues) {
      Object.entries(defaultValues).forEach(([key, value]) => {
        setValue(key as keyof ProductFormInput, value as never);
      });
    }
  }, [defaultValues, setValue]);

  function generateSlug() {
    const name = watch("name") ?? "";
    setValue("slug", slugFromTitle(name), { shouldValidate: true, shouldDirty: true });
  }

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleImageUpload(file: File | null) {
    if (!file) return;
    setUploadingImage(true);
    setUploadError(null);
    try {
      const url = await uploadAdminImage(file, "menu");
      setValue("imageUrl", url, { shouldDirty: true, shouldValidate: true });
    } catch {
      setUploadError("Не удалось загрузить изображение. Попробуйте другой файл.");
    } finally {
      setUploadingImage(false);
    }
  }

  const fieldClass =
    "w-full rounded-xl border border-vanilla-200 bg-vanilla-50 px-4 py-2.5 text-sm text-vanilla-900 placeholder:text-vanilla-400 focus:border-vanilla-500 focus:outline-none focus:ring-2 focus:ring-vanilla-500/20";
  const labelClass = "mb-1 block text-xs font-medium text-vanilla-700";
  const errorClass = "mt-1 text-xs text-red-500";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {/* Название */}
      <div>
        <label className={labelClass}>Название <span className="text-red-500">*</span></label>
        <input {...register("name")} placeholder="Например, Пицца Маргарита" className={fieldClass} />
        {errors.name && <p className={errorClass}>{errors.name.message}</p>}
      </div>

      {/* Адрес в URL (латиница) */}
      <div>
        <label className={labelClass}>Адрес в ссылке (латиница) <span className="text-red-500">*</span></label>
        <div className="flex gap-2">
          <input {...register("slug")} placeholder="naprimer-picca-margarita" className={fieldClass} />
          <button
            type="button"
            onClick={generateSlug}
            className="shrink-0 rounded-xl border border-vanilla-200 px-3 py-2 text-xs font-medium text-vanilla-600 hover:bg-vanilla-100"
          >
            Авто
          </button>
        </div>
        {errors.slug && <p className={errorClass}>{errors.slug.message}</p>}
      </div>

      {/* Категория */}
      <div>
        <label className={labelClass}>Категория <span className="text-red-500">*</span></label>
        <select {...register("categoryId")} className={fieldClass}>
          <option value="">— выберите категорию —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {errors.categoryId && <p className={errorClass}>{errors.categoryId.message}</p>}
      </div>

      {/* Цена */}
      <div>
        <label className={labelClass}>Цена (₽) <span className="text-red-500">*</span></label>
        <input {...register("price")} type="number" min="1" placeholder="350" className={fieldClass} />
        {errors.price && <p className={errorClass}>{errors.price.message}</p>}
      </div>

      {/* Граммовка */}
      <div>
        <label className={labelClass}>Граммовка / объём</label>
        <input {...register("weight")} placeholder="250г / 300мл" className={fieldClass} />
      </div>

      {/* URL изображения */}
      <div>
        <label className={labelClass}>URL изображения</label>
        <input {...register("imageUrl")} type="url" placeholder="https://..." className={fieldClass} />
        <div className="mt-2">
          <input
            type="file"
            accept="image/*"
            disabled={uploadingImage}
            onChange={(e) => void handleImageUpload(e.target.files?.[0] ?? null)}
            className="block w-full cursor-pointer text-xs text-vanilla-600 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-vanilla-100 file:px-3 file:py-2 file:text-xs file:font-medium file:text-vanilla-700 hover:file:bg-vanilla-200"
          />
          <p className="mt-1 text-xs text-vanilla-500">
            Загрузка с ПК и автосжатие для фото блюд (до 1280px, WebP).
          </p>
          {uploadingImage ? <p className="mt-1 text-xs text-vanilla-500">Загружаем...</p> : null}
          {uploadError ? <p className={errorClass}>{uploadError}</p> : null}
        </div>
        {errors.imageUrl && <p className={errorClass}>{errors.imageUrl.message}</p>}
      </div>

      {/* Описание */}
      <div>
        <label className={labelClass}>Краткое описание</label>
        <textarea {...register("description")} rows={2} placeholder="Описание товара..." className={`${fieldClass} resize-none`} />
      </div>

      {/* Состав */}
      <div>
        <label className={labelClass}>Состав</label>
        <textarea {...register("composition")} rows={2} placeholder="Ингредиенты..." className={`${fieldClass} resize-none`} />
      </div>

      {/* Флаги */}
      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input {...register("isHidden")} type="checkbox" className="h-4 w-4 rounded border-vanilla-300 text-vanilla-500 focus:ring-vanilla-500" />
          <span className="text-sm text-vanilla-700">Скрыт из меню</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input {...register("isStopList")} type="checkbox" className="h-4 w-4 rounded border-vanilla-300 text-vanilla-500 focus:ring-vanilla-500" />
          <span className="text-sm text-vanilla-700">Стоп-лист</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-vanilla-500 py-3 text-sm font-semibold text-white transition hover:bg-vanilla-400 disabled:opacity-60"
      >
        {isSubmitting ? "Сохранение..." : submitLabel}
      </button>
    </form>
  );
}
