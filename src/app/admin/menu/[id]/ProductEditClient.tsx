"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { ProductForm } from "@/components/admin/ProductForm";
import { useVenueStore } from "@/store/venueStore";
import type { ProductFormData } from "@/lib/validations/product.schema";

interface Category { id: string; name: string; }

interface ProductDetail {
  id: string; name: string; slug: string; description: string | null;
  imageUrl: string | null; weight: string | null; composition: string | null;
  price: number; categoryId: string; isHidden: boolean; isStopList: boolean;
}

/**
 * Клиентский компонент страницы редактирования / создания товара.
 *
 * При `productId === "new"` — форма создания.
 * Иначе — загружает товар по id и заполняет форму.
 *
 * @param productId - ID товара или "new"
 */
export function AdminProductEditClient({ productId }: { productId: string }) {
  const router = useRouter();
  const selectedVenue = useVenueStore((s) => s.selectedVenue);
  const isNew = productId === "new";

  const [categories, setCategories] = useState<Category[]>([]);
  const [defaultValues, setDefaultValues] = useState<Partial<ProductFormData> | undefined>();
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!selectedVenue) return;

    const [catRes, prodRes] = await Promise.all([
      fetch(`/api/admin/categories?venueId=${selectedVenue.id}`),
      isNew ? Promise.resolve(null) : fetch(`/api/admin/products/${productId}`),
    ]);

    const catJson = await catRes.json() as { ok: boolean; categories: Category[] };
    if (catJson.ok) setCategories(catJson.categories);

    if (prodRes) {
      const prodJson = await prodRes.json() as { ok: boolean; product: ProductDetail };
      if (prodJson.ok) {
        const p = prodJson.product;
        setDefaultValues({
          name: p.name, slug: p.slug,
          description: p.description ?? "", imageUrl: p.imageUrl ?? "",
          weight: p.weight ?? "", composition: p.composition ?? "",
          price: Math.round(p.price / 100),
          categoryId: p.categoryId,
          isHidden: p.isHidden, isStopList: p.isStopList,
        });
      }
    }
    setIsLoading(false);
  }, [selectedVenue, productId, isNew]);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleSubmit(data: ProductFormData) {
    if (!selectedVenue) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const url = isNew ? "/api/admin/products" : `/api/admin/products/${productId}`;
      const method = isNew ? "POST" : "PATCH";
      const body = isNew ? { venueId: selectedVenue.id, ...data } : data;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json() as { ok: boolean; error?: string };

      if (json.ok) {
        router.push("/admin/menu");
      } else {
        const msgs: Record<string, string> = {
          SLUG_TAKEN: "Этот slug уже занят другим товаром",
          VALIDATION_ERROR: "Проверьте заполнение формы",
        };
        setError(msgs[json.error ?? ""] ?? "Ошибка сервера");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!selectedVenue) {
    return (
      <div className="rounded-2xl border border-dashed border-vanilla-300 py-16 text-center text-vanilla-500">
        Выберите заведение, чтобы управлять товарами.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/menu" className="text-vanilla-500 hover:text-vanilla-700">
          ← Меню
        </Link>
        <h1 className="font-serif text-2xl font-bold text-vanilla-900">
          {isNew ? "Добавить блюдо" : "Редактировать блюдо"}
        </h1>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-vanilla-200 bg-white p-6 shadow-sm">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((k) => (
              <div key={k} className="h-10 animate-pulse rounded-xl bg-vanilla-200" />
            ))}
          </div>
        ) : (
          <ProductForm
            categories={categories}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel={isNew ? "Создать" : "Сохранить изменения"}
          />
        )}
      </div>
    </div>
  );
}
