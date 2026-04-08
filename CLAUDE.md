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

### ueeet (бэкенд-разработчик)
- **Зона ответственности:** `backend/`
- НЕ трогать файлы в `frontend/`
- Все изменения API фиксировать в `API_DOCS.md`
- При изменении API — уведомить напарника через issue/комментарий

### tagirov3322-blip (фронтенд-разработчик)
- **Зона ответственности:** `frontend/`
- НЕ трогать файлы в `backend/`
- API-контракт брать из `API_DOCS.md`
- При необходимости нового эндпоинта — создать issue

### Общие файлы
- `API_DOCS.md` — контракт между фронтом и бэком (редактирует бэкенд)
- `CLAUDE.md` — правила проекта (редактируют оба по согласованию)
- `.gitignore`, `render.yaml` — общие конфиги

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

## Git-воркфлоу
- Перед работой: `git pull origin master`
- Один репозиторий, две папки
- Каждый работает ТОЛЬКО в своей папке
- Конфликтов быть не должно при соблюдении зон
- При крупных изменениях API — создавать PR вместо прямого push в master
