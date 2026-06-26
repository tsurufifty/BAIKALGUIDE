# PROJECT MEMORY — Байкал гайд

> Источник истины проекта. Обновляется после каждого завершённого этапа.
> Последнее обновление: завершены **все этапы 1–8**. Проведена консолидация дубликатов (см. §10). Остаётся финальный прогон сборки на машине заказчика.

---

## 1. Краткое описание

Молодёжный туристический портал Республики Бурятия. Разделы: туризм,
гастротуризм, афиша, музыкальный блог, маршруты, карта, медиа. Аудитория 17–35.
Акцент — визуал, интерактив, мобильность.

Структура репозитория (monorepo):

```
baikal-guide/
├── docker-compose.yml          # запуск всего стека одной командой
├── .env.example                # единый источник env для compose
├── PROJECT_MEMORY.md           # этот файл
├── README.md
├── docker/
│   ├── frontend.Dockerfile
│   ├── backend.Dockerfile
│   └── nginx/{conf.d, ssl}
├── frontend/                   # Next.js 16 (App Router, API-first)
│   ├── app/[locale]/           # локализованные маршруты
│   ├── app/sw.ts               # Serwist service worker
│   ├── src/i18n/               # routing / request / navigation
│   ├── src/lib/                # strapi-клиент, утилиты
│   └── messages/{ru,en}.json   # тексты интерфейса (без хардкода)
└── backend/                    # Strapi 5 (единственный источник данных)
    ├── config/                 # database/server/admin/plugins/middlewares
    └── src/api, src/components  # коллекции и компоненты
```

---

## 2. Архитектурные решения (ADR)

| # | Решение | Причина |
|---|---------|---------|
| ADR-1 | **Strapi 5 — единственный источник данных и схемы.** PostgreSQL управляется Strapi; ручных миграций нет. | Документ `04_DATABASE_SCHEMA` трактуется как модель контент-типов Strapi, а не отдельная БД — иначе два источника истины. |
| ADR-2 | **Карты — Yandex Maps JS API 3.0.** | Изначально был Mapbox (решение заказчика), но регистрация Mapbox требует зарубежных банковских данных — недоступно. Перешли на Yandex (бесплатный тариф 25k запросов/сут, ключ по Yandex ID без карты). Гео-компонент по-прежнему хранит порядок `lng/lat` (совместимо с GeoJSON и Yandex v3). Скрипт грузится лениво, кластеризация — `@yandex/ymaps3-clusterer`. |
| ADR-3 | **PWA через Serwist (`@serwist/next`), не next-pwa.** SW отключён в dev, собирается в production. | Next.js 16 по умолчанию использует Turbopack; Turbopack не поддерживает webpack-плагины, на которых построен next-pwa. Serwist совместим. |
| ADR-4 | **i18n: next-intl (интерфейс) + Strapi i18n (контент).** Локали `ru` (default) и `en`, префикс в URL всегда. | Требование мультиязычности; SEO с отдельными URL и hreflang. |
| ADR-5 | **API-first, фронтенд не хранит данные.** Типизированный клиент `src/lib/strapi.ts`. | Подготовка к будущему мобильному приложению (один REST-контракт на web и mobile). |
| ADR-6 | **SEO под поисковики и AI Search.** Компонент `shared.seo` содержит OG, Twitter, `schemaType`, `structuredData` (JSON-LD) и repeatable `faq` (FAQPage). | Требование заказчика: Schema.org / Article / FAQ Schema. |
| ADR-7 | **Tailwind v4 (CSS-конфиг `@theme`) + дизайн-токены из `03_DESIGN_SYSTEM`.** | Современный стек; токены = единый источник стилей. |
| ADR-8 | **Next.js standalone output + nginx reverse proxy + Docker Compose.** | Компактный образ, единая точка входа, SSL. |
| ADR-9 | **Избранное/комментарии привязываются к пользователю в контроллерах Strapi; комментарии — премодерация.** | Безопасность: клиент не может подделать автора; модерация роль Moderator. |
| ADR-10 | **PDF маршрута — серверный route handler на pdf-lib с явным встраиванием Montserrat (subset).** | Кириллица: стандартные PDF-шрифты её не содержат. |
| ADR-11 | **JSON-LD строится из SEO-компонента; FAQPage под AI Search.** | Видимость в поиске и AI-ответах. |

---

## 3. Стек (зафиксированные версии-диапазоны)

**Frontend:** Next.js ^16.2, React 19.2, TypeScript ^5.7 (strict), next-intl ^4,
Tailwind v4, framer-motion ^12, Yandex Maps JS API 3.0 (через внешний скрипт), lucide-react, Serwist ^9.
**Backend:** Strapi ^5, pg ^8, плагин users-permissions; i18n — встроенный в ядро v5.
**Инфра:** PostgreSQL 16, nginx 1.27, Docker Compose.

> Точные версии фиксируются в lock-файлах при первом `npm install`.

---

## 4. Модель данных (Strapi)

Коллекции (все локализуемы, Draft&Publish, slug, cover, seo):

- **route** — title, slug, description(blocks), duration, season(enum),
  difficulty(enum), price(decimal), gallery, coordinates(`map.geo-point`,
  repeatable — путевые точки), locations(M:N), seo.
- **event** — title, slug, date, endDate, venue, description, image, cover,
  location(M:1→location), coordinates, seo.
- **location** — title, slug, description, category(enum), coordinates(required),
  cover, gallery, events(1:M), routes(M:N), seo.
- **article** (музблог) — title, slug, excerpt, content(blocks),
  category(enum), publishedDate, cover, artists(M:N), seo.
- **artist** — name, slug, genre, biography(blocks), avatar, cover, articles(M:N), seo.

Пользовательские (НЕ локализуемы, без Draft&Publish):

- **favorite** — user(M:1) + типизированные связи route/event/location/article.
- **comment** — content, approved(bool, для модерации), user(M:1),
  article(M:1), route(M:1).

Компоненты: `shared.seo`, `shared.faq-item`, `map.geo-point`.

---

## 5. Роли админки (настраиваются в панели Strapi)

| Роль | Права |
|------|-------|
| **Admin** | Полный доступ: контент, медиа, пользователи, настройки, роли. |
| **Editor** | Создание/редактирование/публикация всех коллекций контента и медиа. Без доступа к настройкам и пользователям. |
| **Moderator** | Чтение контента; управление `comment` (поле `approved`) и пользовательскими данными. Без публикации контента. |

> **Strapi CE/EE:** кастомные admin-роли бесплатны в Community Edition с v4.8
> (Strapi 5 это унаследовал) — Editor и Moderator создаются без Enterprise.
> Ограничение CE: нет прав уровня поля и кастомных условий (это EE). Поэтому
> **Moderator** проектируется на уровне типов контента (полный CRUD по `comment`,
> чтение остального), без field-level ограничений.
>
> Admin-роли создаются в Settings → Administration Panel → Roles после первого
> запуска. **Права REST API** (роли Public/Authenticated) настраиваются
> автоматически в `backend/src/index.ts` (bootstrap) — ручной клик не нужен.

---

## 6. Конвенции

- **TypeScript strict**, запрет `any` (ESLint error), `noUncheckedIndexedAccess`.
- **Без хардкода текста** в компонентах — только `messages/{ru,en}.json`.
- **Без хардкода данных** — только через `src/lib/strapi.ts`.
- **Радиусы** 16–24px (`--radius-md/card/lg`), палитра — токены в `globals.css`.
- **Все секреты** — в `.env` (корневой для Docker; `*/.env` для локального dev).
- Один способ решения задачи; не плодим дубли компонентов.

---

## 7. Проблемы и решения

- **Turbopack ↔ next-pwa.** Решено переходом на Serwist (ADR-3). Если
  production-сборка падает на генерации SW — временный фолбэк `next build --webpack`.
- **Кириллица в PDF-экспорте маршрутов** (предстоит на этапе фич): использовать
  серверный рендер с явным встраиванием шрифта Montserrat, не клиентский.
- **Вес карты**: решено ленивой загрузкой (`next/dynamic`, `ssr:false`); скрипт
  Yandex Maps подгружается только на странице карты, кластеризация — аддон
  `@yandex/ymaps3-clusterer` (грузится через `ymaps3.import`).
- **Дубли компонентов при сборке этапа 5.** В рабочей директории обнаружился
  параллельный набор компонентов (auth-dialog, user-menu, social/*, events-browser,
  mapbox-map), конфликтовавший с основным (двойные импорты). Проведена
  консолидация на единый канон (`auth-form`, `comments`, `favorite-button`,
  `map-view/map-explorer`, `routes-explorer`, `events-calendar`), дубли удалены,
  детальные страницы и navbar переписаны начисто. Статическая проверка: все
  `@/`-импорты резолвятся, dangling-ссылок нет.

---

## 8. Статус этапов

- [x] **Этап 1 — Архитектура и каркас.** Структура, Docker, схема Strapi,
  i18n-каркас, PWA-конфиг, дизайн-токены, PROJECT_MEMORY.
- [~] **Этап 2 — Strapi.** Сделано (код): автонастройка прав Public/Authenticated
  в bootstrap, сид-контент Бурятии на ru/en (флаг `SEED_DATA`). Осталось на
  машине заказчика: поднять стек, создать первого админа, роли Editor/Moderator,
  проверить локали и выдачу API.
- [x] **Этап 3 — Фронтенд-фундамент.** Layout с Navbar (стеклянная, адаптивная,
  мобильное меню) и Footer; переключатель языка (next-intl, сохраняет путь и
  выбор); UI-примитивы (Button/Container на cva); карточки маршрута и события;
  компонент Reveal (Framer Motion, мягкие появления); главная страница и список
  маршрутов тянут данные из Strapi через типизированный слой `lib/api.ts` с
  graceful-fallback (пустое состояние, если бэкенд недоступен). Локали расширены.
- [x] **Этап 4 — Страницы и детальные роуты.** Рендер Strapi blocks-контента
  (`BlockContent`); страница маршрута (cover-hero, мета-сайдбар, галерея, точки);
  страница и листинг событий; музблог (статьи + артисты) и страница статьи;
  карта-заглушка (интерактив — на этапе фич); статические О проекте / FAQ / Контакты.
  Все страницы с `generateMetadata`, тянут данные по slug из Strapi.
- [x] **Этап 5 — Фичи.** Карта Yandex Maps v3 с кластеризацией и фильтром по категориям
  (ленивая загрузка, ssr:false); фильтры+поиск по маршрутам; календарь афиши
  (группировка по месяцам); авторизация Strapi JWT (контекст + формы login/register,
  страница аккаунта); избранное и комментарии (бэкенд-контроллеры привязывают
  к текущему пользователю, комментарии — премодерация `approved=false`); PDF-экспорт
  маршрута на pdf-lib с встраиванием кириллического шрифта.
- [x] **Этап 6 — SEO / AI Search.** metadataBase, OpenGraph/Twitter, hreflang
  (alternates) на листингах и в layout; JSON-LD: WebSite, Organization, TouristTrip,
  Event, Article, FAQPage (из SEO-компонента и FAQ-страницы); `sitemap.ts` с
  локализованными URL и hreflang; `robots.ts`.
- [x] **Этап 7 — Производительность.** ISR (`revalidate`) на листингах; ленивая
  загрузка карты; immutable-кэш статики и security-заголовки в `next.config`;
  loading-скелетоны; image-оптимизация (avif/webp) задана ранее.
- [x] **Этап 8 — Эксплуатация.** `docs/`: запуск, обновление, бэкап,
  восстановление, работа с админкой.
- [ ] Финал — прогон `build/typecheck/lint` и Lighthouse на машине заказчика.

---

## 9. Не проверено в песочнице

Сеть в среде сборки отключена, поэтому НЕ выполнялись: `npm install`,
`docker compose up`, сборка, проверка типов и линтера. Эти проверки —
обязательны на машине заказчика (см. README).

**Этап 2 (не запускался):** bootstrap-права и сид-скрипт написаны по паттернам
Strapi 5 (Document Service для локализации, users-permissions query для прав),
но не тестировались. Оба обёрнуты в try/catch и не валят старт. Сид защищён
проверкой пустой БД и флагом `SEED_DATA`. Если сигнатуры Document Service в
конкретной версии 5.x отличаются — поправить в `backend/src/seed/seed.ts`.

---

## 10. Консолидация дубликатов (финальный проход 5–8)

В рабочем дереве обнаружились параллельно созданные конфликтующие файлы.
Сведено к одному канону:

- **Auth.** Канон: `src/lib/auth.ts` (API-функции `login`/`register`/`fetchMe`,
  тип `AuthUser`) + `src/context/auth-context.tsx` (`AuthProvider` + `useAuth`,
  ключ токена `baikal_jwt`). Удалён лишний `src/lib/auth.tsx` — он делал импорт
  `@/lib/auth` неоднозначным и обращался к Strapi без префикса `/api`. В
  `layout.tsx` убран дублирующий импорт `AuthProvider` (остался только из
  `@/context/auth-context`).
- **PDF.** Канон: `app/[locale]/routes/[slug]/pdf/route.ts` (на него ведёт ссылка
  со страницы маршрута). Удалён дубль `app/api/routes/[slug]/pdf/route.ts`.

Проверки после консолидации: все `@/`-импорты резолвятся; коллизий имён
модулей нет; ru/en в полном ключевом паритете; все JSON валидны.

## 11. Что нужно сделать заказчику перед запуском

1. `NEXT_PUBLIC_YANDEX_MAPS_API_KEY` — без него карта показывает заглушку. Ключ
   бесплатно в кабинете разработчика Яндекса (Yandex ID, банковская карта не нужна).
2. Положить `Montserrat-Regular.ttf` и `Montserrat-SemiBold.ttf` в
   `frontend/public/fonts/` — иначе PDF-экспорт кириллических маршрутов
   завершится ошибкой (StandardFonts не кодируют кириллицу).
3. Прогнать `npm install && npm run build && npm run typecheck && npm run lint`
   во `frontend/` и `npm install && npm run build` в `backend/` — в песочнице
   сеть была отключена, статически проверены только импорты и JSON.

## 12. Согласования с заказчиком (по ТЗ)

- **Стек согласован.** Заказчик утвердил технологический стек проекта —
  **фронтенд (Next.js 16) и бэкенд (Strapi 5 / Node.js / PostgreSQL)**. Требование
  ТЗ о платформе 1С-Битрикс и привязанные к ней пункты (PHP/Composer, композитный
  сайт, проактивная защита и антивирус Битрикс, SEO-модуль и отчёты Битрикс,
  лицензия Битрикс) **сняты** и при сверке с ТЗ как несоответствие не считаются.

## 13. Доработки по ТЗ (открытый список)

Функциональные расхождения с ТЗ, оставшиеся после снятия платформенных
требований (см. §12). Контент-раздел с видео / shorts / влогами / 360°
**пока пропускаем** — отложено.

**Главная страница:**
- [x] Блок «Навигация по интересам» (адреналин / душа / культура / контент) —
  4 карточки с иконками в `app/[locale]/page.tsx`, тексты в `Home.interest*`.
  Ссылки ведут на ближайший раздел (`/routes`, `/events`, `/music`); привязка к
  реальному фильтру маршрутов ждёт поля `activityType` в схеме route.
- [x] Топ-подборки: маршрут недели (берёт первый маршрут как placeholder до
  поля `featured`), скрытые места (→ `/map`), бюджетные поездки (→ `/routes`).
- [ ] Hero пока статичный (фото) — по ТЗ нужен видео/слайдер. **Отложено**
  (решение заказчика: вернуться позже; нужен видеофайл).
- [x] Превью карты региона — баннер-секция со ссылкой на `/map` (без загрузки
  Yandex-скрипта, для производительности).

**Маршруты:**
- [x] Фильтры расширены: тип активности (`activityType`), длительность (бакеты по
  `durationDays`: 1 / 2–3 / 4+), бюджет (бакеты по `price`), плюс сезон и
  сложность. См. `routes-explorer.tsx`, namespaces `Activity`/`RoutesFilter`.
- [x] Рейтинг — **пользовательский**: новая коллекция Strapi `rating`
  (value 1–5, user M:1, route M:1) с контроллером-upsert (одна оценка на
  пользователя на маршрут); права в bootstrap (`index.ts`). Фронт:
  `rating-widget.tsx` (звёзды + средняя оценка), средняя оценка в карточке
  маршрута (`route-card.tsx`). Средняя считается из populate `ratings`
  (`routeRating` в `api.ts`).
- [x] На странице маршрута добавлены **таймлайн** (визуальный, из `coordinates`)
  и блок **логистики** (новое поле `logistics`, blocks, локализуемое).

Изменения схемы route: `durationDays` (int), `activityType` (enum),
`logistics` (blocks), `ratings` (relation). Сид (`seed/data.ts`, `seed.ts`)
наполняет новые поля для демо-маршрутов.

> Заметка по приватности: публичный `find` для `rating` отдаёт строки оценок;
> при необходимости скрыть авторов — ограничить populate/поле `user` политикой.

**Сервисные страницы:**
- [x] Добавлены: «Как добраться» (`/getting-there`), «Транспорт» (`/transport`),
  «Безопасность» (`/safety`), «Партнёры» (`/partners`), «Обратная связь»
  (`/feedback`). Общий компонент `info-sections.tsx`; контент в namespaces
  `GettingThere/Transport/Safety/Partners/Feedback` (ru/en). Ссылки — в футере
  (группа «Сервис»), пути добавлены в `sitemap.ts`.
- [x] Обратная связь — рабочая форма: коллекция Strapi `feedback`
  (name/email/message/handled) + публичное `create` в bootstrap; контроллер
  форсит `handled=false`; фронт `feedback-form.tsx` шлёт POST на `/api/feedbacks`.

**Шаринг в соцсети:**
- [x] Компонент `share-buttons.tsx` (Telegram, VK, WhatsApp + копирование
  ссылки) на страницах маршрута, события и статьи. Namespace `Share` (ru/en).

**Снято по решению заказчика (не делаем):**
- Аналитика (Яндекс.Метрика / Google Analytics) — пропускаем.
- Hero-видео/слайдер — пропускаем (остаётся статичное фото).

**Рестайл — откатан по просьбе заказчика.**
- Editorial-рестайл по концепту Koton был сделан и затем **полностью откатан**
  к прежнему дизайну. Возвращены: шрифты (Montserrat + Manrope), радиусы и
  токены `globals.css` (без `.h-display`/`.eyebrow`/`--color-hairline`), кнопки,
  карточки (route/event/article/artist/info), navbar, footer, hero и заголовки
  секций/страниц/детальных страниц. Фичи (сервисные страницы, шаринг, доработки
  маршрутов) при откате не затронуты.
- Референс на будущее (если вернёмся): Behance «Koton redesign concept»
  (https://www.behance.net/gallery/130230611/Koton-redesign-concept).

**Смена палитры (пробуем):**
- Новые токены в `globals.css`: primary `#0f414a` (midnight blue),
  secondary `#96c0ce` (light blue), accent `#7f0303` (maroon),
  background `#efe8df` (alabaster), foreground `#1c2426`, muted `#7a7470`,
  добавлен `--color-sand` `#d8ba98` (tan, пока опционально).
- Контраст подправлен там, где на цветном фоне был светлый текст: топ-подборки
  (акценты → light blue на midnight), превью карты (тёмный текст на light blue,
  тёмная кнопка). Остальные accent-вхождения — на светлом фоне, читаются.

## 14. Идеи из анализа patagonia.com.au (реализовано)

- [x] **Раздел «Береги Байкал»** (`/eco`) — ответственный туризм, заповедные
  зоны, leave-no-trace, как помочь. Namespace `Eco`, в футере (группа «Сервис»).
- [x] **Хаб-страницы по интересам** (`/interests/[interest]` —
  adrenaline/soul/culture/content). Каждый интерес маппится на `activityType`
  (active/relax/culture/nature), страница тянет маршруты по фильтру
  (`getRoutesByActivity` в `api.ts`). Карточки на главной ведут на хабы.
  Namespace `Interests`.
- [x] **Подписка на рассылку** — коллекция Strapi `subscriber`
  (email, source), контроллер идемпотентен по email; публичное `create` в
  bootstrap. Фронт `newsletter-form.tsx` в футере. Namespace `Newsletter`.
- Ещё из анализа на будущее (не делали): полоса ценностей с иконками,
  сторителлинг-журнал, mega-menu, признание культуры Бурятии, layering-гайды.

## 16. Восстановлен слой REST API (важно)

При первом реальном запуске бэкенда обнаружилось, что у контент-типов были только
`content-types/*/schema.json` (+ часть контроллеров), но **не было файлов
`routes/` и `services/`**. Из-за этого Strapi не регистрировал REST-эндпоинты —
`/api/routes` и др. отдавали 404 (админка при этом работала, т.к. использует
внутренний content-manager API). Добавлены стандартные `createCoreRouter` /
`createCoreController` / `createCoreService` для всех 10 типов (route, event,
location, article, artist, comment, favorite, rating, feedback, subscriber).
Кастомные контроллеры (comment/favorite/rating/feedback/subscriber) сохранены.

**Связи в Strapi 5.** REST-валидация отклоняет связи по числовому `id` (400) и
запись связи `user` (`Invalid key user`). Решение: в кастомных контроллерах
создаём записи напрямую через **Document Service** (`strapi.documents(...).create`)
с `connect` + `documentId`, минуя REST-валидацию. Фронт передаёт `documentId`
(не `id`) для route/article/event. Картинки в dev — `images.unoptimized`
(оптимизатор Next спотыкается о `localhost` по IPv6).

**Комментарии: премодерация снята.** Теперь авто-публикация (`approved=true`),
но в контроллере стоит стоп-лист мата (`src/utils/profanity.ts`) — при срабатывании
комментарий отклоняется (`400 profanity`). ADR-9 в этой части устарел.

**Профиль пользователя.** Модель `users-permissions.user` расширена полем `avatar`
(`src/extensions/users-permissions/content-types/user/schema.json`). Добавлен
self-эндпоинт `src/api/profile/` (`GET/PUT /api/profile`) — читает/обновляет
ТОЛЬКО `ctx.state.user` (username/email/avatar), без id из запроса. Права
`api::profile.profile.me/update` + `plugin::upload.content-api.upload` выданы
роли Authenticated в bootstrap. Фронт: `fetchMe` → `/api/profile`, хелперы
`uploadAvatar`/`updateProfile` в `lib/auth.ts`, `refresh()` в auth-context,
редактор `components/auth/profile-editor.tsx` на странице аккаунта. Аватар
показывается в навбаре и комментариях (plain `<img>`, не `next/image`).
Требует рестарта бэкенда (изменение схемы + новый API + права).

**Регистрация только с Mail.ru / Яндекс.** `src/extensions/users-permissions/strapi-server.ts`
оборачивает register-контроллер и отклоняет домены вне белого списка
(mail.ru/bk.ru/list.ru/inbox.ru/internet.ru/yandex.ru/ya.ru/yandex.com) →
`400 email_not_allowed`. Фронт: `lib/email.ts` (`isRussianMail`) + подсказка и
сообщение в `auth-form.tsx` (`Auth.emailHint`/`emailNotAllowed`). Логин не
ограничен. Требует рестарта бэкенда (расширение плагина грузится при старте).

## 15. Правовые страницы

- [x] `/privacy` (Политика конфиденциальности) и `/personal-data` (Политика
  обработки ПДн по 152-ФЗ) — на `InfoSections`, namespaces `Privacy` /
  `PersonalData` (ru/en). Ссылки в нижней строке футера, в `sitemap.ts`.
- **Это шаблоны.** Перед публикацией нужно: подставить реквизиты оператора
  (`[Наименование оператора]`, `[ИНН]`, `[ОГРН]`, `[адрес]`), указать реальный
  контактный email и согласовать с юристом. Также для 152-ФЗ обычно нужен
  чекбокс согласия на формах (обратная связь/регистрация/подписка) со ссылкой
  на эти политики — пока не добавлен.
