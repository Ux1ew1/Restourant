"use client";

/** Пропсы селектора количества перед добавлением в корзину */
export interface QuantitySelectorProps {
  /** Текущее значение */
  value: number;
  /** Минимально допустимое значение */
  min?: number;
  /** Максимально допустимое значение */
  max?: number;
  /** Вызывается при изменении значения (кнопки +/−) */
  onChange: (next: number) => void;
  /**
   * Сброс выбора («Удалить»): обычно возвращает количество к 1 и очищает связанные поля на странице.
   */
  onClear?: () => void;
}

/**
 * Счётчик количества с кнопками «+», «−» и сбросом.
 *
 * Кнопка «Удалить» не уменьшает ниже `min` — она вызывает `onClear`, чтобы страница товара
 * могла сбросить количество и пожелание единым сценарием.
 *
 * @param value - Текущее количество
 * @param min - Нижняя граница (по умолчанию 1)
 * @param max - Верхняя граница (по умолчанию 99)
 * @param onChange - Обработчик нового значения после +/−
 * @param onClear - Обработчик полного сброса блока количества
 *
 * @example
 * <QuantitySelector value={qty} onChange={setQty} onClear={() => { setQty(1); setWishes(""); }} />
 */
export function QuantitySelector({
  value,
  min = 1,
  max = 99,
  onChange,
  onClear,
}: QuantitySelectorProps) {
  const dec = () => {
    if (value > min) onChange(value - 1);
  };
  const inc = () => {
    if (value < max) onChange(value + 1);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex items-center rounded-xl border border-vanilla-300 bg-white p-1">
        <button
          type="button"
          onClick={dec}
          disabled={value <= min}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-lg font-medium text-vanilla-900 transition enabled:hover:bg-vanilla-100 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Уменьшить количество"
        >
          −
        </button>
        <span className="min-w-[2.5rem] px-2 text-center text-sm font-semibold tabular-nums text-vanilla-900">
          {value}
        </span>
        <button
          type="button"
          onClick={inc}
          disabled={value >= max}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-lg font-medium text-vanilla-900 transition enabled:hover:bg-vanilla-100 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Увеличить количество"
        >
          +
        </button>
      </div>
      {onClear ? (
        <button
          type="button"
          onClick={onClear}
          className="rounded-xl border border-vanilla-300 px-3 py-2 text-xs font-medium text-vanilla-700 transition hover:border-vanilla-500 hover:text-vanilla-900"
        >
          Удалить
        </button>
      ) : null}
    </div>
  );
}
