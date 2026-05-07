# Документация сайта restaurant-site

## Версия и история изменений

| Дата | Версия | Изменения |
|------|--------|-----------|
| 07.05.2026 | 1.0 | Инициализация проекта (Этап 0) |
| 07.05.2026 | 1.1 | Схема БД и seed (Этап 1) |
| 07.05.2026 | 1.2 | Аутентификация и роли (Этап 2) |
| 07.05.2026 | 1.3 | Выбор города и заведения (Этап 3) |

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
| `src/app/(public)/page.tsx` | Интеграция выбора на главной и авто-показ |

### API-эндпоинты

| Метод | Путь | Описание | Параметры |
|-------|------|----------|-----------|
| GET | `/api/cities` | Список активных городов | — |
| GET | `/api/venues` | Заведения по городу | `cityId: string` |

### Особенности и ограничения

- Сценарий выбора реализован на клиенте, поэтому зависит от доступности `localStorage`.
- На текущем этапе интеграция сделана на главной странице как демонстрация; дальше выбор будет использован в `Header`, меню и API-запросах.

## 5. Шапка и навигация
[Заполняется после Этапа 4]

## 6. Главная страница
[Заполняется после Этапа 5]

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

