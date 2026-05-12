# Restourant

Сайт ресторана на Next.js App Router с публичной витриной, корзиной, оформлением заказов и административной панелью.

## Стек

- Next.js 15, React 19, TypeScript
- Prisma 7 + PostgreSQL
- Auth.js / NextAuth v5
- Zustand, React Hook Form, Zod
- Tailwind CSS 4
- next-sitemap

## Быстрый старт

1. Установите зависимости:

```bash
npm install
```

2. Скопируйте переменные окружения:

```bash
cp .env.example .env
```

3. Запустите PostgreSQL:

```bash
docker compose up -d
```

4. Примените миграции и заполните тестовые данные:

```bash
npx prisma migrate dev
npx prisma db seed
```

5. Запустите dev-сервер:

```bash
npm run dev
```

Сайт будет доступен на `http://localhost:3000`.

## Переменные окружения

- `DATABASE_URL` - подключение к PostgreSQL.
- `NEXTAUTH_URL` - URL приложения, локально `http://localhost:3000`.
- `NEXTAUTH_SECRET` - секрет Auth.js, минимум 32 символа.
- `NEXT_PUBLIC_SITE_URL` - публичный домен для canonical, Open Graph и sitemap.
- `CLOUDINARY_*` - опционально, если будет подключено внешнее хранилище изображений.

## Основные команды

```bash
npm run dev       # локальная разработка
npm run build     # production-сборка + генерация sitemap/robots
npm start         # запуск production-сервера после build
npm run format    # форматирование Prettier
```

## Админ-панель

Админка находится по адресу `/admin` и защищена ролью `ADMIN`. Тестовый администратор создается seed-скриптом, актуальные логин и пароль смотрите в `prisma/seed.ts`.

## Production

Перед деплоем:

1. Укажите production `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET` и `NEXT_PUBLIC_SITE_URL`.
2. Выполните миграции Prisma на production БД.
3. Соберите проект командой `npm run build`.
4. Задеплойте на Vercel либо запустите `npm start` за reverse proxy на VPS.

После `npm run build` автоматически запускается `next-sitemap`, который создает `public/sitemap.xml` и `public/robots.txt`.

## Оптимизация

Публичные изображения используют `next/image` с `sizes` и ленивой загрузкой ниже первого экрана. Публичные API витрины отдают `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`; пользовательские и административные мутации не кэшируются. Persist-сторы Zustand гидратируются вручную после mount, чтобы избежать SSR/CSR расхождений из-за `localStorage`.

## Deployment

Подробная инструкция вынесена в `docs/deployment.md`.

Для Vercel используется `vercel.json` с build command `npm run deploy:vercel-build`: команда применяет production-миграции и запускает обычную сборку с генерацией Prisma Client, sitemap и robots.

Для VPS/Docker добавлены `Dockerfile` и `docker-compose.prod.yml`. Production-запуск:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

Перед деплоем заполните `.env.production` по шаблону `.env.production.example`: production `DATABASE_URL`, `NEXTAUTH_URL`, `NEXT_PUBLIC_SITE_URL`, `AUTH_SECRET`/`NEXTAUTH_SECRET` и остальные нужные переменные.
