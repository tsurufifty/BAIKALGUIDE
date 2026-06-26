# Байкал гайд

Молодёжный туристический портал Республики Бурятия.
Monorepo: **Next.js 16** (frontend) + **Strapi 5** (backend) + **PostgreSQL** + **nginx**, оркестрация через **Docker Compose**.

> Полная архитектура, решения и модель данных — в [`PROJECT_MEMORY.md`](./PROJECT_MEMORY.md) (источник истины).

## Быстрый старт (Docker)

```bash
cp .env.example .env          # заполнить секреты (openssl rand -base64 32)
docker compose up -d --build  # запуск всего стека
```

После старта:
- Сайт: `https://<домен>` (или `http://localhost` без SSL)
- Админка Strapi: `https://<домен>/admin` — создать первого администратора
- В Settings создать роли **Editor** и **Moderator** (матрица в PROJECT_MEMORY)
- Локали `ru` и `en` создаются автоматически при первом запуске

SSL: положить `fullchain.pem` и `privkey.pem` в `docker/nginx/ssl/`
(например, выпустить certbot'ом; webroot-том `certbot_www` уже подключён).

## Права API и тестовый контент

- Права REST API для ролей **Public** (чтение контента) и **Authenticated**
  (чтение + создание избранного/комментариев) выставляются автоматически при
  старте бэкенда — ручная настройка в админке не нужна.
- Чтобы наполнить базу демо-контентом Бурятии (ru/en) при первом запуске:
  выставьте `SEED_DATA=true` в `.env`, поднимите стек один раз, затем верните
  `SEED_DATA=false`. Сид срабатывает только на пустой базе.

## Локальная разработка (без Docker)

```bash
# backend
cd backend && cp .env.example .env && npm install && npm run develop
# frontend (в другом терминале)
cd frontend && cp .env.example .env && npm install && npm run dev
```

## Обязательные проверки перед коммитом

```bash
cd frontend && npm run typecheck && npm run lint && npm run build
cd backend  && npm run build
```

> В среде, где собирался каркас, сеть была отключена — установка пакетов и
> сборка не выполнялись. Прогоните проверки выше на своей машине.

## Структура

```
frontend/  Next.js 16 — app/[locale], src/i18n, src/lib, messages, app/sw.ts
backend/   Strapi 5  — config, src/api (коллекции), src/components
docker/    Dockerfile'ы и конфиг nginx
```

Полные эксплуатационные инструкции (обновление, бэкап, восстановление, работа с
админкой) будут добавлены на завершающем этапе проекта.
