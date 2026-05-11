"use client";

/** Одна точка данных для графика */
interface BarItem {
  label: string;
  value: number;
}

/** Пропсы компонента StatsChart */
interface StatsChartProps {
  /** Заголовок графика */
  title: string;
  /** Данные для отображения (до 10 элементов) */
  items: BarItem[];
  /** Формат значения (например, «₽» или «шт.») */
  unit?: string;
}

/**
 * Простой горизонтальный столбчатый SVG-график для административной статистики.
 *
 * Не использует внешних библиотек. Значения нормализуются относительно максимума.
 *
 * @param title - Заголовок графика
 * @param items - Массив `{ label, value }`
 * @param unit - Единица измерения для подписи значений
 */
export function StatsChart({ title, items, unit = "" }: StatsChartProps) {
  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="rounded-2xl border border-vanilla-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-vanilla-800">{title}</h3>
      <div className="mt-4 space-y-2.5">
        {items.map((item) => {
          const pct = (item.value / max) * 100;
          return (
            <div key={item.label}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="truncate text-vanilla-700 max-w-[60%]">{item.label}</span>
                <span className="font-semibold text-vanilla-900">
                  {item.value.toLocaleString("ru-RU")}
                  {unit && <span className="ml-0.5 text-vanilla-500">{unit}</span>}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-vanilla-100">
                <div
                  className="h-full rounded-full bg-vanilla-500 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
        {items.length === 0 && (
          <p className="py-4 text-center text-sm text-vanilla-400">Нет данных за период</p>
        )}
      </div>
    </div>
  );
}
