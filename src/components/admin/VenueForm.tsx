"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const venueFormSchema = z.object({
  cityId: z.string().min(1, "Выберите город"),
  name: z.string().trim().min(1, "Введите название").max(200),
  slug: z.string().trim().min(1).regex(/^[a-z0-9-]+$/, "slug: строчные латинские, цифры, дефисы"),
  address: z.string().trim().min(1, "Введите адрес"),
  phone: z.string().trim().max(30).optional(),
  logoUrl: z.string().trim().url("Некорректный URL").optional().or(z.literal("")),
  isActive: z.boolean().optional(),
});

type VenueFormData = z.infer<typeof venueFormSchema>;

interface City { id: string; name: string; }

/** Пропсы компонента VenueForm */
interface VenueFormProps {
  /** Список городов */
  cities: City[];
  /** Начальные значения для редактирования */
  defaultValues?: Partial<VenueFormData>;
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
 * @param cities - Список городов для выбора
 * @param defaultValues - Предзаполненные значения
 * @param onSubmit - Колбэк с данными формы
 * @param isSubmitting - Блокировка при сохранении
 * @param submitLabel - Текст кнопки
 */
export function VenueForm({ cities, defaultValues, onSubmit, isSubmitting = false, submitLabel = "Сохранить" }: VenueFormProps) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<VenueFormData>({
    resolver: zodResolver(venueFormSchema),
    defaultValues: { isActive: true, ...defaultValues },
  });

  const fc = "w-full rounded-xl border border-vanilla-200 bg-vanilla-50 px-4 py-2.5 text-sm text-vanilla-900 placeholder:text-vanilla-400 focus:border-vanilla-500 focus:outline-none focus:ring-2 focus:ring-vanilla-500/20";
  const lc = "mb-1 block text-xs font-medium text-vanilla-700";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <label className={lc}>Город <span className="text-red-500">*</span></label>
        <select {...register("cityId")} className={fc}>
          <option value="">— выберите город —</option>
          {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {errors.cityId && <p className="mt-1 text-xs text-red-500">{errors.cityId.message}</p>}
      </div>

      <div>
        <label className={lc}>Название <span className="text-red-500">*</span></label>
        <input {...register("name")} placeholder="Название заведения" className={fc} />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
      </div>

      <div>
        <label className={lc}>Slug</label>
        <div className="flex gap-2">
          <input {...register("slug")} placeholder="my-venue" className={fc} />
          <button type="button" onClick={() => {
            const n = watch("name") ?? "";
            setValue("slug", n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
          }} className="shrink-0 rounded-xl border border-vanilla-200 px-3 text-xs text-vanilla-600 hover:bg-vanilla-100">Авто</button>
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
        <input {...register("phone")} type="tel" placeholder="+7 (900) 000-00-00" className={fc} />
      </div>

      <div>
        <label className={lc}>URL логотипа</label>
        <input {...register("logoUrl")} type="url" placeholder="https://..." className={fc} />
        {errors.logoUrl && <p className="mt-1 text-xs text-red-500">{errors.logoUrl.message}</p>}
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input {...register("isActive")} type="checkbox" className="h-4 w-4 rounded border-vanilla-300" />
        <span className="text-sm text-vanilla-700">Заведение активно (показывается клиентам)</span>
      </label>

      <button type="submit" disabled={isSubmitting} className="w-full rounded-xl bg-vanilla-500 py-3 text-sm font-semibold text-white transition hover:bg-vanilla-400 disabled:opacity-60">
        {isSubmitting ? "Сохранение..." : submitLabel}
      </button>
    </form>
  );
}
