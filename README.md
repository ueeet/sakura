# 🌸 Сакура

Многостраничный сайт с админ-панелью, онлайн-записью, портфолио и интеграциями.

## Стек

| Backend | Frontend |
|---------|----------|
| Express + TypeScript | Next.js 16 + TypeScript |
| Prisma + PostgreSQL (Supabase) | Tailwind CSS + shadcn/ui |
| JWT авторизация | GSAP анимации |
| Pino логирование | next-themes (тёмная тема) |

## Возможности

- **Онлайн-запись** — форма на сайте, уведомления админу
- **Управление услугами** — CRUD с категориями и ценами
- **Команда** — карточки сотрудников с фото и описанием
- **Портфолио** — галерея работ «до/после»
- **Отзывы** — парсинг с 2GIS и Яндекс Карт (каждые 4 часа)
- **Админ-панель** — дашборд, управление всеми сущностями, настройки
- **Telegram-бот** — уведомления о новых записях с кнопками подтверждения/отклонения
- **SMS** — уведомления клиентам о статусе записи
- **SSE** — realtime обновления в админке
- **Тёмная тема** — переключатель светлой/тёмной темы

## Структура проекта

```
sakura/
├── backend/
│   ├── prisma/           # Схема БД
│   └── src/
│       ├── routes/       # API эндпоинты
│       ├── middleware/    # Auth, validation, asyncHandler
│       ├── lib/          # Утилиты (cache, sse, telegram, sms, logger)
│       └── index.ts      # Entry point
├── frontend/
│   └── src/
│       ├── app/          # Страницы (Next.js App Router)
│       ├── components/   # UI компоненты
│       └── lib/          # API клиент, типы, SSE
├── API_DOCS.md           # Документация API
├── CLAUDE.md             # Правила проекта
└── render.yaml           # Конфиг деплоя
```

## Быстрый старт

### 1. Клонирование

```bash
git clone https://github.com/ueeet/sakura.git
cd sakura
```

### 2. Backend

```bash
cd backend
cp .env.example .env     # Заполнить данными Supabase
npm install
npm run db:generate      # Генерация Prisma клиента
npm run db:push          # Создание таблиц в БД
npm run dev              # http://localhost:4000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev              # http://localhost:3000
```

### 4. Первый вход в админку

```bash
curl -X POST http://localhost:4000/api/auth/setup \
  -H "Content-Type: application/json" \
  -d '{"login": "admin", "password": "your_password"}'
```

Затем перейти на http://localhost:3000/admin/login

## Переменные окружения

| Переменная | Описание |
|-----------|----------|
| `DATABASE_URL` | PostgreSQL строка подключения (Supabase) |
| `DB_PASSWORD` | Пароль БД |
| `JWT_SECRET` | Секрет для JWT токенов |
| `SUPABASE_URL` | URL проекта Supabase |
| `SUPABASE_ANON_KEY` | Anon ключ Supabase |
| `TELEGRAM_BOT_TOKEN` | Токен Telegram бота |
| `TELEGRAM_CHAT_ID` | ID чата для уведомлений |
| `SMS_API_KEY` | API ключ sms.ru |
| `DGIS_API_KEY` | API ключ 2GIS |
| `DGIS_FIRM_ID` | ID организации в 2GIS |
| `YANDEX_ORG_ID` | ID организации в Яндекс |

## Деплой

- **Backend** — [Render](https://render.com) (`render.yaml` готов)
- **Frontend** — [Vercel](https://vercel.com) (указать `frontend` как root directory)

## Команда

| Роль | GitHub | Зона |
|------|--------|------|
| Backend | [@ueeet](https://github.com/ueeet) | `backend/` |
| Frontend | [@tagirov3322-blip](https://github.com/tagirov3322-blip) | `frontend/` |
| Visioner | [@Ratmir123](https://github.com/Ratmir123) | — |

## API

Полная документация API — в [API_DOCS.md](API_DOCS.md).

## Лицензия

MIT
