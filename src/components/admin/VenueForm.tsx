"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { uploadAdminImage } from "@/lib/admin-image-upload";
import { slugFromTitle } from "@/lib/slugFromTitle";
import { imageUrlSchema } from "@/lib/validations/image-url";
import { optionalPhoneSchema, PHONE_MASK_EXAMPLE } from "@/lib/validations/phone";

/** Значение селекта «Город»: создать новый (не отправляется в API как id). */
const NEW_CITY_SELECT_VALUE = "__new_city__";

const venueFormSchema = z.object({
  cityId: z
    .string()
    .min(1, "Выберите город")
    .refine((v) => v !== NEW_CITY_SELECT_VALUE, {
      message: "Введите название нового города и перейдите к следующему полю (или выберите город из списка)",
    }),
  name: z.string().trim().min(1, "Введите название").max(200),
  slug: z.string().trim().min(1).regex(/^[a-z0-9-]+$/, "Только строчные латинские буквы, цифры и дефисы"),
  address: z.string().trim().min(1, "Введите адрес"),
  phone: optionalPhoneSchema().optional(),
  logoUrl: imageUrlSchema("Некорректный URL").optional().or(z.literal("")),
  isActive: z.boolean().optional(),
  storyEnabled: z.boolean().optional(),
  storyTitle: z.string().trim().max(160).optional().or(z.literal("")),
  storyText: z.string().trim().max(900).optional().or(z.literal("")),
  bookingEnabled: z.boolean().optional(),
});

type VenueFormData = z.infer<typeof venueFormSchema>;

interface City {
  id: string;
  name: string;
  /** Если false — город не показывается в витрине (только админка) */
  isActive?: boolean;
}

/** Результат создания города из формы заведения */
export type CreateCityResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

/** Пропсы компонента VenueForm */
interface VenueFormProps {
  /** Список городов для выбора */
  cities: City[];
  /** Начальные значения для редактирования */
  defaultValues?: Partial<VenueFormData>;
  /** Создание города: только название, slug на сервере из названия */
  onCreateCity: (data: { name: string }) => Promise<CreateCityResult>;
  /** Колбэк при сабмите */
  onSubmit: (data: VenueFormData) => void;
  /** Блокировка кнопки */
  isSubmitting?: boolean;
  /** Текст кнопки */
  submitLabel?: string;
}

/**
 * Форма создания / редактирования заведения.
 *
 * В списке городов есть пункт «Новый город»: показывается одно поле названия;
 * после потери фокуса город создаётся (slug генерируется на сервере) и выбирается в селекте.
 *
 * @param cities - Список городов для выбора
 * @param defaultValues - Предзаполненные значения
 * @param onCreateCity - POST нового города, возвращает id или ошибку
 * @param onSubmit - Колбэк с данными формы
 * @param isSubmitting - Блокировка при сохранении
 * @param submitLabel - Текст кнопки
 */
export function VenueForm({
  cities,
  defaultValues,
  onCreateCity,
  onSubmit,
  isSubmitting = false,
  submitLabel = "Сохранить",
}: VenueFormProps) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<VenueFormData>({
    resolver: zodResolver(venueFormSchema),
    defaultValues: {
      isActive: true,
      storyEnabled: false,
      storyTitle: "Итальянские традиции в каждом блюде",
      storyText:
        "Мы вдохновлены уютными семейными ресторанами северной Италии и европейскими кулинарными традициями. Каждое блюдо — это сочетание качества, вкуса и любви к своему делу.",
      bookingEnabled: false,
      ...defaultValues,
    },
  });

  const cityId = watch("cityId");
  const [newCityName, setNewCityName] = useState("");
  const [creatingCity, setCreatingCity] = useState(false);
  const [createCityError, setCreateCityError] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadLogoError, setUploadLogoError] = useState<string | null>(null);

  useEffect(() => {
    if (cityId !== NEW_CITY_SELECT_VALUE) {
      setNewCityName("");
      setCreateCityError(null);
    }
  }, [cityId]);

  const fc = "w-full rounded-xl border border-vanilla-200 bg-vanilla-50 px-4 py-2.5 text-sm text-vanilla-900 placeholder:text-vanilla-400 focus:border-vanilla-500 focus:outline-none focus:ring-2 focus:ring-vanilla-500/20";
  const lc = "mb-1 block text-xs font-medium text-vanilla-700";

  async function tryCreateNewCityOnBlur() {
    if (cityId !== NEW_CITY_SELECT_VALUE || creatingCity) return;
    const name = newCityName.trim();
    if (!name) {
      setCreateCityError("Введите название города");
      return;
    }
    setCreatingCity(true);
    setCreateCityError(null);
    const result = await onCreateCity({ name });
    setCreatingCity(false);
    if (result.ok) {
      setValue("cityId", result.id, { shouldValidate: true, shouldDirty: true });
    } else {
      setCreateCityError(result.error);
    }
  }

  async function handleLogoUpload(file: File | null) {
    if (!file) return;
    setUploadingLogo(true);
    setUploadLogoError(null);
    try {
      const url = await uploadAdminImage(file, "venue");
      setValue("logoUrl", url, { shouldValidate: true, shouldDirty: true });
    } catch {
      setUploadLogoError("Не удалось загрузить логотип. Попробуйте другой файл.");
    } finally {
      setUploadingLogo(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <label className={lc}>Город <span className="text-red-500">*</span></label>
        <select {...register("cityId")} className={fc}>
          <option value="">— выберите город —</option>
          {cities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}{c.isActive === false ? " (на сайте скрыт)" : ""}
            </option>
          ))}
          <option value={NEW_CITY_SELECT_VALUE}>+ Новый город…</option>
        </select>
        {errors.cityId && <p className="mt-1 text-xs text-red-500">{errors.cityId.message}</p>}

        {cityId === NEW_CITY_SELECT_VALUE && (
          <div className="mt-2">
            <input
              value={newCityName}
              onChange={(e) => {
                setNewCityName(e.target.value);
                if (createCityError) setCreateCityError(null);
              }}
              onBlur={() => void tryCreateNewCityOnBlur()}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  (e.target as HTMLInputElement).blur();
                }
              }}
              placeholder="Название нового города"
              disabled={creatingCity}
              autoFocus
              className={fc}
            />
            {creatingCity && <p className="mt-1 text-xs text-vanilla-500">Создаём город…</p>}
            {createCityError && !creatingCity && <p className="mt-1 text-xs text-red-500">{createCityError}</p>}
          </div>
        )}
      </div>

      <div>
        <label className={lc}>Название <span className="text-red-500">*</span></label>
        <input {...register("name")} placeholder="Название заведения" className={fc} />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
      </div>

      <div>
        <label className={lc}>Адрес в ссылке (латиница)</label>
        <div className="flex gap-2">
          <input {...register("slug")} placeholder="naprimer-tochka" className={fc} />
          <button
            type="button"
            onClick={() => {
              const n = watch("name") ?? "";
              setValue("slug", slugFromTitle(n), { shouldValidate: true, shouldDirty: true });
            }}
            className="shrink-0 rounded-xl border border-vanilla-200 px-3 text-xs text-vanilla-600 hover:bg-vanilla-100"
          >
            Авто
          </button>
        </div>
        {errors.slug && <p className="mt-1 text-xs text-red-500">{errors.slug.message}</p>}
      </div>

      <div>
        <label className={lc}>Адрес <span className="text-red-500">*</span></label>
        <input {...register("address")} placeholder="ул. Ленина, 1" className={fc} />
        {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address.message}</p>}
      </div>

      <div>
        <label className={lc}>Телефон</label>
        <input {...register("phone")} type="tel" placeholder={PHONE_MASK_EXAMPLE} className={fc} />
        {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
      </div>

      <div>
        <label className={lc}>URL логотипа</label>
        <input {...register("logoUrl")} type="url" placeholder="https://..." className={fc} />
        <div className="mt-2">
          <input
            type="file"
            accept="image/*"
            disabled={uploadingLogo}
            onChange={(e) => void handleLogoUpload(e.target.files?.[0] ?? null)}
            className="block w-full cursor-pointer text-xs text-vanilla-600 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-vanilla-100 file:px-3 file:py-2 file:text-xs file:font-medium file:text-vanilla-700 hover:file:bg-vanilla-200"
          />
          <p className="mt-1 text-xs text-vanilla-500">
            Загрузка с ПК и автосжатие для логотипа заведения (до 800px, WebP).
          </p>
          {uploadingLogo ? <p className="mt-1 text-xs text-vanilla-500">Загружаем...</p> : null}
          {uploadLogoError ? <p className="mt-1 text-xs text-red-500">{uploadLogoError}</p> : null}
        </div>
        {errors.logoUrl && <p className="mt-1 text-xs text-red-500">{errors.logoUrl.message}</p>}
      </div>

      <label className="flex cursor-pointer items-center gap-2">
        <input {...register("isActive")} type="checkbox" className="h-4 w-4 rounded border-vanilla-300" />
        <span className="text-sm text-vanilla-700">Заведение активно (показывается клиентам)</span>
      </label>

      <div className="rounded-2xl border border-vanilla-200 bg-white p-4">
        <label className="flex cursor-pointer items-center gap-2">
          <input {...register("storyEnabled")} type="checkbox" className="h-4 w-4 rounded border-vanilla-300" />
          <span className="text-sm font-medium text-vanilla-800">Показывать блок «История ресторана»</span>
        </label>
        <div className="mt-3 space-y-3">
          <div>
            <label className={lc}>Заголовок истории</label>
            <input {...register("storyTitle")} className={fc} />
            {errors.storyTitle && <p className="mt-1 text-xs text-red-500">{errors.storyTitle.message}</p>}
          </div>
          <div>
            <label className={lc}>Текст истории</label>
            <textarea {...register("storyText")} rows={4} className={fc} />
            {errors.storyText && <p className="mt-1 text-xs text-red-500">{errors.storyText.message}</p>}
          </div>
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-2">
        <input {...register("bookingEnabled")} type="checkbox" className="h-4 w-4 rounded border-vanilla-300" />
        <span className="text-sm text-vanilla-700">Показывать блок бронирования (сейчас по умолчанию скрыт)</span>
      </label>

      <button type="submit" disabled={isSubmitting} className="w-full rounded-xl bg-vanilla-500 py-3 text-sm font-semibold text-white transition hover:bg-vanilla-400 disabled:opacity-60">
        {isSubmitting ? "Сохранение..." : submitLabel}
      </button>
    </form>
  );
}
