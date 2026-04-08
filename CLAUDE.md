# Сакура — Многостраничный сайт с админкой

## Архитектура
- **backend/** — Express + TypeScript + Prisma + PostgreSQL (Supabase)
- **frontend/** — Next.js + TypeScript + Tailwind CSS + shadcn/ui + GSAP
- **API_DOCS.md** — контракт между фронтом и бэком

## Сущности
- Staff (сотрудники)
- Services (услуги)
- Bookings (записи/заявки)
- PortfolioWork (портфолио)
- Review (отзывы — парсинг 2GIS/Yandex)

## Интеграции
- Telegram-бот уведомления о новых заявках
- SSE realtime обновления в админке
- SMS уведомления клиентам
- Парсинг отзывов (2GIS/Yandex)

## Разделение зон
- Бэкенд-разработчик: папка backend/
- Фронтенд-разработчик: папка frontend/
- API_DOCS.md — общий документ

## Команды

### Backend
```bash
cd backend
npm run dev        # Запуск dev-сервера (порт 4000)
npm run build      # Сборка TypeScript
npm run db:push    # Синхронизация Prisma → БД
npm run db:generate # Генерация Prisma клиента
npm run db:studio  # Prisma Studio
```

### Frontend
```bash
cd frontend
npm run dev   # Запуск dev-сервера (порт 3000)
npm run build # Сборка
```

## Git
- Перед работой: `git pull origin master`
- Один репозиторий, две папки
