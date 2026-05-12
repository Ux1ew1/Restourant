# Деплой и инфраструктура

Проект подготовлен к двум production-сценариям: Vercel + внешний PostgreSQL и VPS/Docker + внешний или локальный PostgreSQL.

## Production-переменные

Создайте переменные по шаблону `.env.production.example`.

Обязательные значения:

- `DATABASE_URL` - production PostgreSQL URL с доступом к схеме `public`.
- `NEXTAUTH_URL` - финальный HTTPS-адрес сайта.
- `NEXT_PUBLIC_SITE_URL` - тот же публичный HTTPS-адрес для sitemap, canonical и Open Graph.
- `AUTH_SECRET` и `NEXTAUTH_SECRET` - одинаковый стойкий секрет минимум 32 символа.
- `NODE_ENV=production`.

## Production PostgreSQL

Подходят Supabase, Railway или собственный VPS PostgreSQL 15+. Для managed-сервисов используйте pooled connection string, если платформа ограничивает количество соединений.

Перед первым запуском выполните миграции:

```bash
npm run db:migrate:deploy
```

Seed в production запускайте только осознанно:

```bash
npm run db:seed
```

## Vercel

1. Подключите репозиторий к Vercel.
2. Добавьте переменные из `.env.production.example`.
3. Укажите production PostgreSQL в `DATABASE_URL`.
4. Оставьте build command из `vercel.json`: `npm run deploy:vercel-build`.
5. Выполните деплой.

Команда `deploy:vercel-build` применяет миграции через `prisma migrate deploy`, затем запускает `npm run build` с генерацией Prisma Client и sitemap/robots.

## VPS / Docker

Создайте `.env.production` по шаблону `.env.production.example`, затем соберите и запустите контейнеры:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

`docker-compose.prod.yml` сначала запускает сервис `migrate`, который применяет Prisma-миграции. После успешных миграций стартует `app` на порту `3000`.

Для публичного домена поставьте перед контейнером Nginx/Caddy и включите SSL через Let's Encrypt. Проксируйте HTTPS-трафик на `http://127.0.0.1:3000`.

## Домен и SSL

Для Vercel добавьте домен в Project Settings -> Domains и пропишите DNS-записи, которые покажет Vercel. SSL выпускается автоматически.

Для VPS используйте A-запись на IP сервера и reverse proxy с автоматическим сертификатом. После подключения домена обновите `NEXTAUTH_URL` и `NEXT_PUBLIC_SITE_URL`.

## Production smoke test

После деплоя проверьте:

- главная страница открывается по HTTPS;
- `/menu` возвращает товары из production БД;
- регистрация и вход работают;
- `/admin` доступен только пользователю с ролью `ADMIN`;
- создание заказа пишет данные в production БД;
- `/sitemap.xml` и `/robots.txt` отдают production-домен;
- изображения из внешних HTTPS-источников отображаются через `next/image`.
