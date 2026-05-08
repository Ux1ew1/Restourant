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
- Добавлены минимальные страницы-заглушки `/cart` и `/menu`, чтобы ссылки из навигации не вели на 404 до этапов 6 и 8.
- Добавлен `cartStore` + хук `useCart`: на этапе 4 бейдж использует `totalQuantity` (полная корзина — этап 8).

### Ключевые файлы

| Файл | Назначение |
|------|-----------|
| `src/components/layout/Header.tsx` | Шапка: заведение, навигация, auth, корзина, моб. меню |
| `src/components/layout/Footer.tsx` | Подвал: контакты и ссылки |
| `src/components/layout/VenuePickerHost.tsx` | Модалки выбора города/заведения + автопоказ после гидрации |
| `src/app/(public)/layout.tsx` | Обёртка публичных страниц |
| `src/app/providers.tsx` | `SessionProvider` для `useSession` в шапке |
| `src/store/cartStore.ts` | Zustand: `totalQuantity` для бейджа (persist) |
| `src/hooks/useCart.ts` | Доступ к данным корзины для UI |
| `src/store/venueStore.ts` | Расширен: состояние открытия мастера выбора (`openVenuePicker` и др.) |
| `src/app/(public)/cart/page.tsx` | Заглушка корзины |
| `src/app/(public)/menu/page.tsx` | Заглушка меню |

### Особенности и ограничения

- Контакты в подвале — примеры (телефон/email); замените на реальные перед продакшеном.
- `cartStore` на этапе 4 содержит только счётчик для бейджа; логика позиций появится на этапе 8.

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
- Ссылки на товар ведут на маршрут этапа 7; до его реализации возможен 404.
- `GET /api/categories` добавлен в рамках главной; при прохождении этапа 6 убедитесь, что страница меню использует тот же контракт query-параметра `category`.

### Зависимости

- Новых пакетов не добавлялось (Framer Motion и Next.js Image уже в проекте).

## 7. Страница меню
[Заполняется после Этапа 6]

## 8. Страница товара
[Заполняется после Этапа 7]

## 9. Корзина
[Заполняется после Этапа 8]

## 10. Оформление заказа
[Заполняется после Этапа 9]

## 11. Административная панель
[Заполняется после Этапа 10]

## 12. SEO
[Заполняется после Этапа 11]

## 13. Деплой и инфраструктура
[Заполняется после Этапа 13]

