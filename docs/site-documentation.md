# Документация сайта restaurant-site

## Версия и история изменений

| Дата | Версия | Изменения |
|------|--------|-----------|
| 07.05.2026 | 1.0 | Инициализация проекта (Этап 0) |
| 07.05.2026 | 1.1 | Схема БД и seed (Этап 1) |
| 07.05.2026 | 1.2 | Аутентификация и роли (Этап 2) |
| 07.05.2026 | 1.3 | Выбор города и заведения (Этап 3) |
| 07.05.2026 | 1.4 | Шапка, подвал, cartStore-бейдж (Этап 4) |
| 07.05.2026 | 1.5 | Доработка стилей: шрифты, глобальный CSS, форма входа/регистрации, шапка, подвал, hero главной |
| 08.05.2026 | 1.6 | Главная страница: API новостей/популярного/категорий, слайдер, блоки UI, метаданные |
| 08.05.2026 | 1.7 | Страница меню: категории, сетка товаров, фильтр по query, API списка продуктов |
| 08.05.2026 | 1.8 | Страница товара, API карточки, корзина с строками и пожеланиями (база до этапа 8) |
| 08.05.2026 | 1.9 | Страница корзины: список позиций, итог, заглушка `/checkout` |
| 11.05.2026 | 2.0 | Оформление заказа: формы доставки/самовывоза, API заказов, страница подтверждения (Этап 9) |
| 11.05.2026 | 2.1 | Административная панель: заказы, меню, категории, заведения, новости, пользователи, статистика (Этап 10) |
| 12.05.2026 | 2.2 | SEO: metadata, canonical, JSON-LD, Open Graph и next-sitemap (Этап 11) |
| 12.05.2026 | 2.3 | Оптимизация: next/image, API cache headers, hydration fixes, README и финальные проверки (Этап 12) |
| 12.05.2026 | 2.4 | Деплой: production env, Vercel, Docker/VPS, автоматические миграции и deployment-документация (Этап 13) |

---

## 1. Инфраструктура и конфигурация

**Этап roadmap:** 0  
**Дата выполнения:** 07.05.2026

### Что реализовано

- Инициализирован базовый каркас проекта на Next.js (App Router) + TypeScript.
- Подключён Tailwind CSS и добавлена кастомная палитра `vanilla-*`.
- Настроены ESLint и Prettier (включая `prettier-plugin-tailwindcss`).
- Настроен alias абсолютных импортов `@/` → `src/*`.
- Добавлены Prisma (schema с datasource/generator) и локальный PostgreSQL через `docker-compose.yml`.
- Добавлен шаблон переменных окружения `.env.example`.
- Подготовлена базовая конфигурация NextAuth v5 (Auth.js) и route handler.
- Создана целевая структура директорий (`src/app`, `src/lib` и т.д.) и плейсхолдеры изображений.

### Ключевые файлы

| Файл | Назначение |
|------|-----------|
| `next.config.ts` | Базовая конфигурация Next.js (локаль `ru`, настройки изображений) |
| `tsconfig.json` | TypeScript + абсолютные импорты `@/` |
| `tailwind.config.ts` | Тема Tailwind с палитрой `vanilla-*` |
| `postcss.config.mjs` | PostCSS-плагин Tailwind v4 |
| `.eslintrc.json` | ESLint конфигурация (Next.js preset) |
| `.prettierrc.json` | Prettier + сортировка классов Tailwind |
| `.env.example` | Шаблон переменных окружения |
| `docker-compose.yml` | Локальный PostgreSQL (stage/dev) |
| `prisma.config.ts` | Конфигурация Prisma CLI (Prisma v7) |
| `prisma/schema.prisma` | Prisma schema (модели, enum'ы, связи) |
| `src/app/layout.tsx` | Root layout (`lang="ru"`) |
| `src/app/globals.css` | Глобальные стили + Tailwind директивы |
| `src/lib/prisma.ts` | Синглтон Prisma Client |
| `src/lib/auth.ts` | Базовая конфигурация NextAuth v5 |
| `src/app/api/auth/[...nextauth]/route.ts` | Route handler NextAuth |
| `public/images/placeholder/*.svg` | Плейсхолдеры для изображений товара/заведения |

### Особенности и ограничения

- Конфигурация NextAuth на этапе 0 является базовой: провайдер Credentials подключён как “заглушка”.
- Prisma-схема на этапе 0 содержит только datasource/generator — модели будут добавлены на этапе 1.

### Зависимости

- Next.js, TypeScript, Tailwind CSS, Prisma, NextAuth, Zustand, Framer Motion, React Hook Form, Zod
- Prettier + `prettier-plugin-tailwindcss`

### Стилевая система (v1.5)

- Подключены шрифты через `next/font/google`: **Inter** (основной, переменная `--font-sans`) и **Playfair Display** (заголовки, переменная `--font-serif`).
- В `globals.css` добавлены: `scroll-behavior: smooth`, кастомный `::selection`, стилизация `*:focus-visible` и специфический focus-ring для полей ввода.
- Утилита `font-serif` (Tailwind v4) использует переменную `--font-serif`, автоматически подхватывая Playfair Display.
- Компоненты форм (`LoginClient`, `RegisterPage`) и заголовков модалей переведены на `font-serif` для h1.
- Кнопка мобильного меню в `Header` заменена на SVG-иконку hamburger / крестик с анимацией Framer Motion.

## 2. База данных

**Этап roadmap:** 1  
**Дата выполнения:** 07.05.2026

### Что реализовано

- Описана схема БД в `prisma/schema.prisma` (User/City/Venue/Category/Product/Order/OrderItem/NewsItem/PopularProduct + enum `Role`).
- Подготовлены уникальности, индексы и каскадные правила удаления.
- Добавлен `prisma/seed.ts` с тестовыми данными (1 город, 2 заведения, категории, товары, админ).
- Настроен Prisma CLI под Prisma v7 через `prisma.config.ts` (подключение URL и команда seed).
- Обновлён `src/lib/prisma.ts` под Prisma v7 + PostgreSQL driver adapter (`@prisma/adapter-pg`).

### Ключевые файлы

| Файл | Назначение |
|------|-----------|
| `prisma/schema.prisma` | Модели и связи БД |
| `prisma.config.ts` | URL datasource и конфиг миграций/seed для Prisma CLI |
| `prisma/seed.ts` | Заполнение БД тестовыми данными |
| `src/lib/prisma.ts` | Prisma Client с PostgreSQL adapter |

### Схема данных (кратко)

- `User` — пользователи, роль `Role` (GUEST/USER/ADMIN)
- `City` → `Venue` → (`Category`, `Product`)
- `Order` + `OrderItem` — заказы и позиции заказа
- `NewsItem` — новости/баннеры (опционально по заведению)
- `PopularProduct` — популярные позиции по заведению

### Особенности и ограничения

- Для выполнения миграций нужен доступный PostgreSQL. Если Docker не установлен, используйте облачный PostgreSQL и укажите его в `DATABASE_URL`, либо установите Docker Desktop и поднимите БД через `docker-compose.yml`.

## 3. Аутентификация

**Этап roadmap:** 2  
**Дата выполнения:** 07.05.2026

### Что реализовано

- Настроен NextAuth v5 (Auth.js) с Credentials провайдером (email + пароль).
- Пароли хранятся в БД в виде `passwordHash` (bcrypt).
- JWT и Session расширены полями пользователя: `id`, `role`, `phone`.
- Реализована регистрация пользователя через `POST /api/auth/register`.
- Добавлены страницы входа и регистрации: `src/app/(auth)/login/page.tsx`, `src/app/(auth)/register/page.tsx`.
- Добавлен middleware, защищающий `/admin` (только роль `ADMIN`).
- Добавлен хук `useCurrentUser` для получения текущего пользователя на клиенте.

### Ключевые файлы

| Файл | Назначение |
|------|-----------|
| `src/lib/auth.ts` | NextAuth конфигурация (Credentials + callbacks) |
| `src/types/next-auth.d.ts` | Расширение типов Session/JWT (id/role/phone) |
| `src/app/api/auth/[...nextauth]/route.ts` | NextAuth route handler |
| `src/app/api/auth/register/route.ts` | Регистрация пользователя |
| `src/lib/validations/auth.schema.ts` | Zod-схемы login/register |
| `src/app/(auth)/login/page.tsx` | UI входа (RHF + Zod) |
| `src/app/(auth)/register/page.tsx` | UI регистрации (RHF + Zod) |
| `src/middleware.ts` | Защита `/admin` только для `ADMIN` |
| `src/hooks/useCurrentUser.ts` | Хук текущего пользователя |

### API-эндпоинты

| Метод | Путь | Описание | Параметры |
|-------|------|----------|-----------|
| POST | `/api/auth/register` | Регистрация пользователя | `name?: string, email: string, phone?: string, password: string` |
| GET/POST | `/api/auth/[...nextauth]` | NextAuth handler (signin/signout/session) | — |

### Особенности и ограничения

- На этапе 2 используется только Credentials (без OAuth провайдеров).
- Middleware для `/admin` перенаправляет не-ADMIN на `/login?callbackUrl=/admin/...`.

## 4. Выбор города и заведения

**Этап roadmap:** 3  
**Дата выполнения:** 07.05.2026

### Что реализовано

- Добавлен Zustand-стор выбора города/заведения с `persist` в `localStorage`.
- Реализовано модальное окно выбора города с загрузкой из API.
- Реализован слайд-экран выбора заведения (выезжающая панель) на Framer Motion.
- При первом визите, если выбор не сохранён, UI автоматически запускает сценарий выбора.
- Выбор сохраняется в `localStorage`, при повторном визите модалки не показываются.
- Добавлены API-эндпоинты для получения городов и заведений.

### Ключевые файлы

| Файл | Назначение |
|------|-----------|
| `src/store/venueStore.ts` | Zustand store (selectedCity/selectedVenue) + persist |
| `src/hooks/useVenue.ts` | Удобный доступ к store |
| `src/components/modals/CityModal.tsx` | Модалка выбора города |
| `src/components/modals/VenueModal.tsx` | Слайд выбора заведения (Framer Motion) |
| `src/app/api/cities/route.ts` | `GET /api/cities` |
| `src/app/api/venues/route.ts` | `GET /api/venues?cityId=` |
| `src/app/(public)/layout.tsx` | Шапка, подвал, хост модалок выбора |
| `src/app/(public)/page.tsx` | Главная: быстрый доступ к смене города/заведения |

### API-эндпоинты

| Метод | Путь | Описание | Параметры |
|-------|------|----------|-----------|
| GET | `/api/cities` | Список активных городов | — |
| GET | `/api/venues` | Заведения по городу | `cityId: string` |

### Особенности и ограничения

- Сценарий выбора реализован на клиенте, поэтому зависит от доступности `localStorage`.
- На текущем этапе интеграция сделана на главной странице как демонстрация; дальше выбор будет использован в `Header`, меню и API-запросах.

## 5. Шапка и навигация

**Этап roadmap:** 4  
**Дата выполнения:** 07.05.2026

### Что реализовано

- Добавлены компоненты шапки и подвала для публичной зоны.
- В шапке: логотип (или плейсхолдер), название заведения с открытием мастера смены точки, адрес, навигация, блок авторизации (NextAuth session), иконка корзины с бейджом.
- Реализовано мобильное меню (кнопка «Меню» с раскрывающейся панелью).
- Публичный layout оборачивает страницы `(public)` шапкой и подвалом; выбор города/заведения вынесен в `VenuePickerHost`.
- Добавлены минимальные страницы `/cart` и `/menu`, чтобы ссылки из навигации не вели на 404 до этапов 6 и 8; `/cart` расширена на этапе 8, `/checkout` — заглушка до этапа 9.
- Добавлен `cartStore` + хук `useCart`: бейдж в шапке; строки корзины и страница `/cart` — этапы 7–8 (см. раздел 9).

### Ключевые файлы

| Файл | Назначение |
|------|-----------|
| `src/components/layout/Header.tsx` | Шапка: заведение, навигация, auth, корзина, моб. меню |
| `src/components/layout/Footer.tsx` | Подвал: контакты и ссылки |
| `src/components/layout/VenuePickerHost.tsx` | Модалки выбора города/заведения + автопоказ после гидрации |
| `src/app/(public)/layout.tsx` | Обёртка публичных страниц |
| `src/app/providers.tsx` | `SessionProvider` для `useSession` в шапке |
| `src/store/cartStore.ts` | Zustand: строки корзины, `totalQuantity`, persist `restaurant-cart` |
| `src/hooks/useCart.ts` | Доступ к данным корзины для UI |
| `src/store/venueStore.ts` | Расширен: состояние открытия мастера выбора (`openVenuePicker` и др.) |
| `src/app/(public)/cart/page.tsx` | Страница корзины с `metadata` |
| `src/app/(public)/cart/CartPageClient.tsx` | Список позиций и итог |
| `src/app/(public)/checkout/page.tsx` | Заглушка оформления (этап 9) |
| `src/app/(public)/menu/page.tsx` | Страница меню (этап 6) |

### Особенности и ограничения

- Контакты в подвале — примеры (телефон/email); замените на реальные перед продакшеном.
- `cartStore` и страница корзины описаны в разделе 9 (этапы 7–8).

### Изменения v1.5 (стили)

- `Footer` переработан: добавлена серифная бренд-подпись «Restaurant», трёхколоночная сетка, улучшен ритм интервалов.
- `Header`: кнопка мобильного меню заменена на SVG hamburger/крестик с `aria-label` и `transition`.
- `(auth)/layout.tsx`: добавлены серифный логотип и подзаголовок над формами входа/регистрации; выравнивание `justify-center`.
- Форма входа и регистрации: белый фон (`bg-white`), лучший padding, состояния `hover` и `focus` на инпутах, серифный заголовок, ошибки в `bg-red-50` блоке.
- `(public)/page.tsx`: серверные мета-теги и клиентская главная (`HomePageClient`) — hero, слайдер новостей, популярное, категории (этап 5).

## 6. Главная страница

**Этап roadmap:** 5  
**Дата выполнения:** 08.05.2026

### Что реализовано

- Главная разделена на серверный `page.tsx` (статические `metadata`: title и description) и клиентский `HomePageClient` с hero и данными по выбранному заведению.
- После выбора точки загружаются новости, популярные позиции и категории; при смене заведения запросы отменяются через `AbortController`.
- Слайдер новостей на Framer Motion с автопрокруткой и ручными кнопками «Назад/Далее».
- Горизонтальная полоса популярных товаров с ценой (формат из копеек), изображением-заглушкой и ссылкой на `/product/[id]`; пометка «Стоп-лист» при `isStopList`.
- Быстрые ссылки на категории ведут на `/menu?category=<slug>` (страница меню — этап 6).
- Клиентский `HomeMetadataEffect` обновляет `document.title` и `<meta name="description">` после гидрации, когда известно заведение (выбор хранится в `localStorage`, поэтому персонализация только на клиенте).
- Добавлен вспомогательный эндпоинт `GET /api/categories?venueId=` (логически совпадает с этапом 6 roadmap, подключён раньше для блока навигации на главной).

### Ключевые файлы

| Файл | Назначение |
|------|-----------|
| `src/app/(public)/page.tsx` | Серверная обёртка: `metadata`, рендер `HomePageClient` |
| `src/app/(public)/HomePageClient.tsx` | Hero, загрузка данных по `venueId`, сборка секций |
| `src/components/home/HomeMetadataEffect.tsx` | Синхронизация title/description с выбранным заведением |
| `src/components/home/NewsBanner.tsx` | Слайдер баннеров новостей |
| `src/components/home/PopularProducts.tsx` | Полоса популярных позиций |
| `src/components/home/CategoryNav.tsx` | Чипы категорий и ссылка «Всё меню» |
| `src/app/api/news/route.ts` | `GET /api/news?venueId=` |
| `src/app/api/products/popular/route.ts` | `GET /api/products/popular?venueId=` |
| `src/app/api/categories/route.ts` | `GET /api/categories?venueId=` |
| `src/lib/utils.ts` | `formatPriceFromKopecks` для отображения цен |
| `src/types/home.ts` | DTO для ответов главной страницы |
| `prisma/seed.ts` | Доп. новости и популярные позиции для демонстрации UI |

### API-эндпоинты

| Метод | Путь | Описание | Параметры |
|-------|------|----------|-----------|
| GET | `/api/news` | Активные баннеры: для заведения + общие (`venueId` null) | `venueId: string` (обязательно) |
| GET | `/api/products/popular` | Популярные товары заведения (без `isHidden`) | `venueId: string` |
| GET | `/api/categories` | Активные категории заведения, сортировка `sortOrder` | `venueId: string` |

### Особенности и ограничения

- Поисковики и превью соцсетей видят только статические мета-теги из `page.tsx`; динамический title/description для выбранной точки актуален для пользователя в браузере.
- Ссылки на товар ведут на `/product/[id]` (этап 7).
- `GET /api/categories` используется главной и страницей меню; query-параметр категории на `/menu`: `?category=<slug>`.

### Зависимости

- Новых пакетов не добавлялось (Framer Motion и Next.js Image уже в проекте).

## 7. Страница меню

**Этап roadmap:** 6  
**Дата выполнения:** 08.05.2026

### Что реализовано

- Страница `/menu` с серверными мета-тегами и клиентским `MenuPageClient` внутри `Suspense` (из-за `useSearchParams`).
- Загрузка категорий (`GET /api/categories`) и полного списка товаров заведения (`GET /api/products?venueId=`) без скрытых позиций (`isHidden=false`).
- Фильтрация по query `?category=<slug>`: один раздел или режим «Все разделы» с секциями `id="category-<slug>"` для якорей и `scroll-mt`.
- `CategorySidebar`: горизонтальные вкладки на мобильных, вертикальный список на `lg+`.
- `ProductGrid` + `ProductCard`: изображение с заглушкой, название, граммовка, цена, бейджи «Стоп-лист» / «Скрыто», кнопка «В корзину» через `addItem` в `cartStore`, ссылка на `/product/[id]`.
- Некорректный `category` в URL сбрасывается на `/menu` после загрузки категорий.

### Ключевые файлы

| Файл | Назначение |
|------|-----------|
| `src/app/(public)/menu/page.tsx` | `metadata`, `Suspense`, fallback |
| `src/app/(public)/menu/MenuPageClient.tsx` | Загрузка данных, фильтр, секции по категориям |
| `src/components/menu/CategorySidebar.tsx` | Навигация по категориям |
| `src/components/menu/ProductGrid.tsx` | Сетка карточек |
| `src/components/menu/ProductCard.tsx` | Карточка товара |
| `src/app/api/products/route.ts` | `GET /api/products?venueId=&category=` (slug категории) |
| `src/app/api/categories/route.ts` | `GET /api/categories?venueId=` (этап 5–6) |
| `src/store/cartStore.ts` | Строки корзины, `addItem`, persist `restaurant-cart` |
| `src/hooks/useCart.ts` | Экспорт операций корзины |
| `src/types/menu.ts` | DTO меню |

### API-эндпоинты

| Метод | Путь | Описание | Параметры |
|-------|------|----------|-----------|
| GET | `/api/categories` | Активные категории заведения | `venueId: string` |
| GET | `/api/products` | Товары заведения (без скрытых) | `venueId: string`, `category?: string` (slug категории) |

### Особенности и ограничения

- Список товаров запрашивается целиком; фильтр по категории на клиенте при выбранном query (достаточно для текущего объёма seed-данных).
- Страница товара и строки корзины — этап 7; полный UI корзины — этап 8 (см. раздел 9).

### Зависимости

- Новых пакетов не добавлялось.

## 8. Страница товара

**Этап roadmap:** 7  
**Дата выполнения:** 08.05.2026

### Что реализовано

- Маршрут `/product/[id]`: серверная загрузка через `getPublicProductById`, `generateMetadata`, `notFound` для скрытых/несуществующих.
- Макет: на мобильном колонка (изображение сверху), от `lg` — ряд (медиа слева, текст справа).
- Блок деталей: название, заведение и категория, цена, описание, граммовка, состав; предупреждение при несовпадении выбранной точки в шапке.
- `QuantitySelector`: кнопки +/− и «Удалить» (сброс количества и пожеланий на странице).
- Textarea пожеланий (до 500 символов) и кнопка «Добавить в корзину» — вызов `addItem` с количеством и пожеланием.
- `GET /api/products/[id]` — JSON для клиентских сценариев (дублирует правила видимости с серверной утилитой).

### Ключевые файлы

| Файл | Назначение |
|------|-----------|
| `src/app/(public)/product/[id]/page.tsx` | Метаданные, хлебные крошки, `ProductPageClient` |
| `src/app/(public)/product/[id]/ProductPageClient.tsx` | UI и добавление в корзину |
| `src/components/product/QuantitySelector.tsx` | Счётчик количества и сброс |
| `src/app/api/products/[id]/route.ts` | `GET /api/products/[id]` |
| `src/lib/public-product.ts` | Выборка товара для витрины (общая для страницы и API) |
| `src/types/product.ts` | `ProductDetail` |
| `src/types/cart.ts` | `CartItem`, `CartLineProduct` |

### API-эндпоинты

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/products/[id]` | Публичная карточка товара по id |

### Особенности и ограничения

- Персист корзины перенесён на ключ `restaurant-cart` (старый ключ `cart-storage` из ранних этапов не используется).
- Добавление из меню и со страницы товара объединяет строки с одинаковым `product.id` и одинаковым пожеланием (после trim).

### Зависимости

- Новых пакетов не добавлялось.

## 9. Корзина

**Этап roadmap:** 8  
**Дата выполнения:** 08.05.2026

### Что реализовано

- `cartStore` (Zustand + persist `restaurant-cart`): `items`, `totalQuantity`, `addItem`, `removeItem`, `updateQuantity`, `clear` — заложено на этапе 7, на этапе 8 зафиксировано имя `updateQuantity` в публичном API стора.
- Страница `/cart`: серверные `metadata` и клиентский `CartPageClient`.
- `CartItem`: изображение с заглушкой, название и граммовка, пожелание, «+» / «−» / «Удалить», сумма строки (цена × количество).
- `CartSummary`: сумма заказа и кнопка-ссылка «Оформить заказ» на `/checkout`.
- Пустое состояние: текст и кнопка «Перейти в меню».
- Заглушка `/checkout` до этапа 9, чтобы ссылка оформления не вела на 404.

### Ключевые файлы

| Файл | Назначение |
|------|-----------|
| `src/store/cartStore.ts` | Стор корзины и persist |
| `src/hooks/useCart.ts` | Доступ к операциям корзины |
| `src/lib/utils.ts` | `sumCartTotalKopecks` |
| `src/app/(public)/cart/page.tsx` | Метаданные и `CartPageClient` |
| `src/app/(public)/cart/CartPageClient.tsx` | Сборка списка и итога |
| `src/components/cart/CartItem.tsx` | Строка корзины |
| `src/components/cart/CartSummary.tsx` | Итог и оформление |
| `src/app/(public)/checkout/page.tsx` | Заглушка до этапа 9 |

### Особенности и ограничения

- Разные заведения в одной корзине теоретически возможны при смене точки после добавления; валидация при оформлении — этап 9.
- Оформление заказа (формы, `POST /api/orders`) — этап 9.

### Зависимости

- Новых пакетов не добавлялось.

## 10. Оформление заказа

**Этап roadmap:** 9  
**Дата выполнения:** 11.05.2026

### Что реализовано

- Страница оформления заказа `/checkout` с переключателем «Доставка / Самовывоз».
- Форма доставки: улица, номер дома, переключатель «Квартира / Частный дом» (условные поля квартиры и домофона), телефон, время доставки (ближайшее / выбрать время), способ оплаты (карта / наличные), поле «Сдача с...» (только при наличных), комментарий.
- Форма самовывоза: адрес точки отображается автоматически из `venueStore`; телефон, время получения, способ оплаты, комментарий.
- Валидация форм через React Hook Form + Zod (discriminated union по `type`).
- Цены позиций фиксируются из базы данных при создании заказа — клиентским ценам не доверяем.
- Страница подтверждения `/order/[id]` — показывает статус, детали доставки, состав заказа и данные заведения.
- После успешного оформления корзина очищается, клиент перенаправляется на `/order/[id]`.
- Телефон из профиля авторизованного пользователя подставляется в форму автоматически.

### Ключевые файлы

| Файл | Назначение |
|------|-----------|
| `src/lib/validations/checkout.schema.ts` | Zod-схемы форм: `pickupSchema`, `deliverySchema`, `checkoutSchema` |
| `src/app/(public)/checkout/page.tsx` | Серверный компонент: метаданные, сессия → `CheckoutPageClient` |
| `src/app/(public)/checkout/CheckoutPageClient.tsx` | Клиентский компонент: переключатель типа, сводка корзины, обработка отправки |
| `src/app/(public)/order/[id]/page.tsx` | Страница подтверждения/статуса заказа (серверный компонент) |
| `src/components/checkout/DeliveryForm.tsx` | Форма доставки с полями адреса и оплаты |
| `src/components/checkout/PickupForm.tsx` | Форма самовывоза |
| `src/app/api/orders/route.ts` | `POST /api/orders` — создание заказа |
| `src/app/api/orders/[id]/route.ts` | `GET /api/orders/[id]` — деталь заказа |

### API-эндпоинты

| Метод | Путь | Описание | Параметры |
|-------|------|----------|-----------|
| POST | `/api/orders` | Создание нового заказа | Body JSON: `{ venueId, form, items }` |
| GET | `/api/orders/[id]` | Детальная информация о заказе | `id` — идентификатор заказа в пути |

#### POST /api/orders — тело запроса

```ts
{
  venueId: string;          // ID выбранного заведения из venueStore
  form: CheckoutFormData;   // Данные формы (delivery | pickup)
  items: Array<{
    productId: string;
    quantity: number;
    wishes?: string;
  }>;
}
```

Коды ответа:
- `201` `{ ok: true, orderId }` — заказ создан
- `400` `CART_EMPTY` — пустая корзина
- `400` `PRODUCT_UNAVAILABLE` — товар недоступен/снят с продажи
- `400` `VALIDATION_ERROR` — ошибка валидации формы
- `404` `VENUE_NOT_FOUND` — заведение не найдено или неактивно
- `500` `INTERNAL_ERROR` — ошибка сервера

### Схема данных

Заказ записывается в модели `Order` и `OrderItem` (Prisma):

- `Order.type` — `"delivery"` или `"pickup"`
- `Order.status` — начальный статус `"new"`, далее меняется администратором
- `Order.totalPrice` — сумма в копейках, вычисляется из БД-цен
- `Order.address` — адрес доставки, собирается из полей формы: `"улица, д. X, кв. Y, домофон: Z"`
- `Order.changeFrom` — сохраняется только при `paymentMethod = "cash"`
- `OrderItem.price` — цена в копейках на момент заказа (из БД, не из клиента)

### Особенности и ограничения

- Пользователь может оформить заказ без авторизации (`userId = null`).
- При смене заведения после добавления товаров в корзину — `venueId` берётся из `venueStore` и проверяется на сервере.
- Страница `/order/[id]` доступна без авторизации по прямой ссылке (URL передаётся клиенту после оформления).
- Статус заказа на странице подтверждения не обновляется в реальном времени — только SSR-снимок.

### Зависимости

- `react-hook-form` (уже установлен)
- `zod` (уже установлен)
- `@hookform/resolvers` (уже установлен)

## 11. Административная панель

**Этап roadmap:** 10  
**Дата выполнения:** 11.05.2026

### Что реализовано

- Боковая навигационная панель (`AdminSidebar`) со всеми разделами и кнопкой выхода.
- Layout `/admin/layout.tsx` — обёртка с сайдбаром; доступ контролируется middleware (только ADMIN).
- **Заказы** — лента с фильтром по статусу, постраничной загрузкой, автообновлением каждые 30 с; смена статуса через выпадающий список без перезагрузки страницы.
- **Меню** — таблица товаров с поиском, тогглами «Скрыт» / «Стоп-лист», удалением и переходом к редактированию. Страница `/admin/menu/new` для добавления, `/admin/menu/[id]` для редактирования.
- **Категории** — CRUD с переименованием инлайн и кнопками изменения порядка сортировки (▲/▼).
- **Заведения** — список с возможностью добавления, редактирования и включения/отключения.
- **Новости** — создание/удаление баннеров, переключение публикации.
- **Популярное** — добавление из списка товаров, изменение порядка (▲/▼), удаление.
- **Пользователи** — таблица с постраничной загрузкой и сменой роли через выпадающий список.
- **Статистика** — ключевые метрики (заказы, выручка, средний чек, отменены) + горизонтальные бар-чарты: заказы по статусам, топ-10 блюд, выручка по заведениям. Переключатель периода: 24 часа / 7 дней / 30 дней.

### Ключевые файлы

| Файл | Назначение |
|------|-----------|
| `src/app/admin/layout.tsx` | Layout с `AdminSidebar`, оборачивает все admin-страницы |
| `src/components/layout/AdminSidebar.tsx` | Боковая навигация с активным маршрутом и кнопкой выхода |
| `src/app/admin/page.tsx` + `OrdersFeed.tsx` | Лента заказов с фильтром и автообновлением |
| `src/components/admin/OrderCard.tsx` | Карточка заказа со сменой статуса |
| `src/app/admin/menu/page.tsx` + `MenuClient.tsx` | Список товаров с тогглами |
| `src/app/admin/menu/[id]/page.tsx` + `ProductEditClient.tsx` | Форма создания/редактирования товара |
| `src/components/admin/ProductForm.tsx` | React Hook Form + Zod форма товара |
| `src/lib/validations/product.schema.ts` | Zod-схема формы товара |
| `src/app/admin/menu/categories/` + `CategoriesClient.tsx` | Управление категориями |
| `src/app/admin/venues/` + `VenuesClient.tsx` + `VenueForm.tsx` | Управление заведениями |
| `src/app/admin/news/` + `NewsClient.tsx` | Управление баннерами |
| `src/app/admin/popular/` + `PopularClient.tsx` | Управление популярными |
| `src/app/admin/users/` + `UsersClient.tsx` | Управление пользователями |
| `src/app/admin/stats/` + `StatsClient.tsx` | Страница статистики |
| `src/components/admin/StatsChart.tsx` | Горизонтальный бар-чарт (SVG, без зависимостей) |

### API-эндпоинты

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/admin/orders?venueId=&status=&page=` | Список заказов (постраничный) |
| PATCH | `/api/admin/orders/[id]` | Обновление статуса заказа |
| GET | `/api/admin/products?venueId=` | Все товары заведения (включая скрытые) |
| POST | `/api/admin/products` | Создание товара |
| GET/PATCH/DELETE | `/api/admin/products/[id]` | Получение/обновление/удаление товара |
| GET/POST | `/api/admin/categories?venueId=` | Список и создание категорий |
| PATCH/DELETE | `/api/admin/categories/[id]` | Обновление и удаление категорий |
| GET/POST | `/api/admin/venues` | Список и создание заведений |
| GET/POST | `/api/admin/news?venueId=` | Баннеры новостей |
| PATCH/DELETE | `/api/admin/news/[id]` | Обновление и удаление баннера |
| GET/POST | `/api/admin/popular?venueId=` | Популярные позиции |
| PATCH/DELETE | `/api/admin/popular/[id]` | Обновление sortOrder, удаление |
| GET/PATCH | `/api/admin/users` | Список пользователей, смена роли |
| GET | `/api/admin/stats?period=day\|week\|month` | Агрегированная статистика |

### Особенности и ограничения

- Все admin API-маршруты проверяют роль `ADMIN` через `auth()` и возвращают 403 иначе.
- Цена товара в форме — в рублях (целое число); конвертируется в копейки (×100) на сервере.
- При удалении товара, который уже использовался в заказах, Prisma вернёт ConstraintError — API ответит кодом 409 с описанием. UI предлагает скрыть товар вместо удаления.
- Смена заведения на странице `/admin/menu` производится через venueStore (то же заведение, что выбрано на сайте).
- Статистика не агрегирует данные в реальном времени — каждый запрос выполняет GROUP BY запросы к БД.

### Зависимости

- Новых пакетов не добавлялось (используются react-hook-form, zod — уже установлены).

## 12. SEO

**Этап roadmap:** 11  
**Дата выполнения:** 12.05.2026

### Что реализовано

- Добавлен общий SEO-модуль `src/lib/seo.ts`: базовый URL сайта, canonical URL, Open Graph/Twitter metadata, fallback OG-изображение и JSON-LD helper-данные.
- На публичных страницах добавлен `generateMetadata`: главная, меню, карточка товара, корзина, оформление заказа и страница заказа.
- Для главной и меню мета-описания строятся с учётом активного заведения из БД: название, город, адрес и контекст доставки/самовывоза.
- Добавлена JSON-LD разметка: `Organization` и `Restaurant` на главной, `Menu` на странице меню, `Product` на странице товара.
- Добавлен canonical через `alternates.canonical`; `/menu?category=...` канонизируется на `/menu`, пользовательские страницы корзины/checkout/order помечены `noindex`.
- Установлен и настроен `next-sitemap`: после `next build` запускается `postbuild`, генерируются `sitemap.xml` и `robots.txt`; `/admin`, `/api` и `/order` исключены из индексации.
- Добавлено fallback Open Graph изображение `public/og-image.svg`.

### Ключевые файлы

| Файл | Назначение |
|------|-----------|
| `src/lib/seo.ts` | Единая сборка metadata, canonical, URL и JSON-LD данных |
| `src/components/seo/JsonLd.tsx` | Безопасный вывод `<script type="application/ld+json">` |
| `src/app/layout.tsx` | Базовые metadata, `metadataBase`, Open Graph и Twitter defaults |
| `src/app/(public)/page.tsx` | SEO главной + `Organization`/`Restaurant` JSON-LD |
| `src/app/(public)/menu/page.tsx` | SEO меню + `Menu` JSON-LD |
| `src/app/(public)/product/[id]/page.tsx` | SEO карточки товара + `Product` JSON-LD |
| `next-sitemap.config.js` | Конфигурация sitemap и robots |
| `public/og-image.svg` | Fallback изображение для Open Graph |

### Особенности и ограничения

- Серверные метаданные не видят выбор заведения из `localStorage`, поэтому для SEO используется первое активное заведение из базы данных.
- `NEXT_PUBLIC_SITE_URL` добавлен в `.env.example`; в production его нужно установить в домен сайта, иначе sitemap и absolute OG URL возьмут `NEXTAUTH_URL` или `http://localhost:3000`.
- Страницы корзины, checkout и заказа остаются публично доступными, но закрыты от индексации через `robots: noindex`.

### Зависимости

- Добавлен `next-sitemap` в `devDependencies`.

## 13. Оптимизация и тестирование

**Этап roadmap:** 12  
**Дата выполнения:** 12.05.2026

### Что реализовано

- Все найденные изображения в `src` переведены на `next/image`; в админском списке новостных баннеров заменен последний сырой `<img>`.
- Для публичных API витрины добавлен общий helper `src/lib/http-cache.ts` и заголовок `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`.
- Для публичных route handlers добавлен `revalidate = 60`: города, заведения, категории, товары, карточка товара, популярные позиции и новости.
- Клиентские запросы главной страницы и меню больше не используют принудительный `cache: "no-store"`, чтобы не обходить кэширование публичных GET.
- Persist-сторы `venueStore` и `cartStore` переведены на `skipHydration: true`; ручная гидратация выполняется в `AppProviders` после mount. Это снижает риск React hydration mismatch из-за `localStorage`.
- README расширен инструкциями по локальному запуску, переменным окружения, production-сборке, sitemap и деплою.

### Ключевые файлы

| Файл | Назначение |
|------|-----------|
| `src/lib/http-cache.ts` | Единая настройка cache headers публичных API |
| `src/app/api/*/route.ts` | Revalidate и `Cache-Control` для публичных GET |
| `src/app/providers.tsx` | Ручная гидратация Zustand persist-сторов после mount |
| `src/store/venueStore.ts` | `skipHydration` для выбранного города/заведения |
| `src/store/cartStore.ts` | `skipHydration` для корзины |
| `src/app/admin/news/NewsClient.tsx` | Превью баннера через `next/image` |
| `README.md` | Инструкции запуска, сборки и деплоя |

### Проверки

- Проверка исходников: в `src` не осталось `<img>` и клиентских `cache: "no-store"` для витринных GET.
- `npm.cmd run build` успешно проходит production-сборку, type-check и `next-sitemap`; сгенерированы `sitemap.xml` и `sitemap-0.xml`.
- Проверен cache header на `/api/cities`: `public, s-maxage=60, stale-while-revalidate=300`.
- Проведен базовый API smoke/load test по 20 последовательных запросов на публичные endpoints: `/api/cities`, `/api/venues`, `/api/categories`, `/api/products`, `/api/news`, `/api/products/popular`; все запросы вернули 200 и cache header.
- Lighthouse и мобильная визуальная проверка оставлены в статусе `[~]`: локальный production-сервер отвечает 200, но browser runtime в текущем окружении не смог подготовить runtime-файлы. Целевые пороги остаются Performance >= 90, Accessibility >= 90, SEO >= 95.

### Особенности и ограничения

- Кэширование включено только для публичных справочных и витринных GET. Заказы, авторизация и admin API остаются динамическими.
- Значения `s-maxage=60` и `stale-while-revalidate=300` выбраны как безопасный баланс для меню ресторана: изменения из админки могут появляться с небольшой задержкой.
- Для точного Lighthouse-аудита нужен запущенный production-сервер и доступная БД с seed-данными.

## 14. Деплой и инфраструктура

**Этап roadmap:** 13
**Дата выполнения:** 12.05.2026

### Что реализовано

- Добавлен production-шаблон `.env.production.example` с `DATABASE_URL`, `NEXTAUTH_URL`, `NEXT_PUBLIC_SITE_URL`, `AUTH_SECRET`/`NEXTAUTH_SECRET`, Cloudinary-переменными и `NODE_ENV=production`.
- Добавлены npm-скрипты `db:migrate:deploy`, `db:seed`, `deploy:vercel-build`; `prebuild` генерирует Prisma Client перед сборкой.
- Добавлен `vercel.json`: Vercel использует build command `npm run deploy:vercel-build`, которая применяет Prisma migrations и запускает обычный `npm run build` с `postbuild` для sitemap/robots.
- В `next.config.ts` включен `output: "standalone"` для Docker/VPS-сборки.
- Добавлены `Dockerfile`, `.dockerignore` и `docker-compose.prod.yml`. Docker-сценарий запускает отдельный `migrate`-сервис с `prisma migrate deploy`, затем поднимает standalone Next.js app на порту `3000`.
- Добавлен гайд `docs/deployment.md`: production PostgreSQL, Vercel, VPS/Docker, DNS/SSL и smoke-test после деплоя.
- README дополнен кратким deployment-разделом.

### Ключевые файлы

| Файл | Назначение |
|------|-----------|
| `.env.production.example` | Шаблон production-секретов и публичных URL |
| `vercel.json` | Build command для Vercel деплоя |
| `Dockerfile` | Multi-stage сборка: deps, builder, migrator, runner |
| `docker-compose.prod.yml` | VPS-цепочка `migrate` -> `app` |
| `.dockerignore` | Исключения для Docker build context |
| `docs/deployment.md` | Полная инструкция по production-развертыванию |
| `package.json` | Production-скрипты и автомиграции при build |
| `next.config.ts` | Standalone output для Docker |

### Внешние шаги перед публикацией

- Создать production PostgreSQL и вставить его URL в `DATABASE_URL`.
- Сгенерировать секрет Auth.js и задать его в `AUTH_SECRET` и `NEXTAUTH_SECRET`.
- После привязки домена обновить `NEXTAUTH_URL` и `NEXT_PUBLIC_SITE_URL`.
- Для Vercel добавить DNS-записи в Project Settings -> Domains; SSL выдается автоматически.
- Для VPS поставить Nginx/Caddy перед контейнером и включить Let's Encrypt.

### Проверки

- Локальная production-сборка должна проходить через `npm run build`.
- После деплоя проверяются HTTPS, главная, `/menu`, авторизация, `/admin`, создание заказа, `/sitemap.xml`, `/robots.txt` и изображения.

### Особенности и ограничения

- Фактический деплой, выдача SSL-сертификата и проверка production-сайта требуют доступа к Vercel/VPS, production PostgreSQL и DNS.
