/**
 * Заглушка корзины до этапа 8 (ссылка из шапки не должна вести на 404).
 */
export default function CartPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-vanilla-800">Корзина</h1>
      <p className="mt-3 text-vanilla-700">
        Оформление корзины будет реализовано на этапе 8. Сейчас бейдж в шапке можно
        проверить через временное значение в <code className="rounded bg-vanilla-200 px-1">cartStore</code>.
      </p>
    </div>
  );
}
