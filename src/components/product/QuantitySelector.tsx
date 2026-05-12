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
      <div className="inline-flex items-center rounded-xl border border-[#c8a97e]/35 bg-[#f6f1ea] p-1">
        <button
          type="button"
          onClick={dec}
          disabled={value <= min}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-lg font-medium text-[#5a2e2e] transition enabled:hover:bg-[#c8a97e]/25 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Уменьшить количество"
        >
          −
        </button>
        <span className="min-w-[2.5rem] px-2 text-center text-sm font-semibold tabular-nums text-[#1a1a1a]">
          {value}
        </span>
        <button
          type="button"
          onClick={inc}
          disabled={value >= max}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-lg font-medium text-[#2f3a2f] transition enabled:hover:bg-[#c8a97e]/25 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Увеличить количество"
        >
          +
        </button>
      </div>
      {onClear ? (
        <button
          type="button"
          onClick={onClear}
          className="rounded-xl border border-[#c8a97e]/35 px-3 py-2 text-xs font-semibold text-[#5a2e2e] transition hover:border-[#c8a97e] hover:text-[#1a1a1a]"
        >
          Удалить
        </button>
      ) : null}
    </div>
  );
}
