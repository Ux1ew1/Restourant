# Документация сайта restaurant-site

## Версия и история изменений

| Дата | Версия | Изменения |
|------|--------|-----------|
| 07.05.2026 | 1.0 | Инициализация проекта (Этап 0) |

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
| `eslint.config.mjs` | ESLint (flat config) |
| `.prettierrc.json` | Prettier + сортировка классов Tailwind |
| `.env.example` | Шаблон переменных окружения |
| `docker-compose.yml` | Локальный PostgreSQL (stage/dev) |
| `prisma/schema.prisma` | Prisma: generator/datasource |
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
[Заполняется после Этапа 1]

## 3. Аутентификация
[Заполняется после Этапа 2]

## 4. Выбор города и заведения
[Заполняется после Этапа 3]

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

