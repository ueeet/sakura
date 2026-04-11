# Сакура — Многостраничный сайт с админкой

## Архитектура
- **backend/** — Express + TypeScript + Prisma + PostgreSQL (Supabase)
- **frontend/** — Next.js + TypeScript + Tailwind CSS + shadcn/ui + GSAP
- **API_DOCS.md** — контракт между фронтом и бэком

## Сущности (см. `backend/prisma/schema.prisma`)
- **Branch** — филиал (9 комплекс / 50 комплекс): адрес, координаты, телефон, рабочие часы, обложка
- **SaunaCategory** — категория саун внутри филиала ("Семейная" / "Обычная" в 9-м комплексе). Привязана к Branch
- **Sauna** — конкретная сауна: тип (russian/finnish/hamam), вместимость, бассейн, удобства, картинки. Принадлежит Branch и опционально Category. Содержит настройки бронирования (cleaningMinutes, minHours, openHour, closeHour, depositPercent)
- **PriceSlot** — цена за час для сауны по слотам (weekday/weekend × day/evening/night)
- **Promotion** — акции с промокодами и скидками
- **Booking** — бронирование: клиент, телефон, startAt/endAt, гости, статус (`pending_payment` → `new` → `confirmed` → `cancelled` / `completed`), totalPrice, paymentStatus
- **Payment** — платёж по бронированию: provider (`mock` | `yookassa`), amount, status (`pending` → `succeeded` / `canceled`), type (`deposit` | `full`), confirmationUrl
- **Review** — отзыв (источник `site` | `2gis` | `yandex`), привязан к Branch, флаги isApproved/isVisible
- **Settings** — singleton глобальных настроек компании (название, телефон, контакты, флаг SMS)
- **Admin** — учётка админ-панели

## Интеграции
- Telegram-бот уведомления о новых бронированиях и платежах
- SSE realtime обновления в админке
- SMS уведомления клиентам
- Парсинг отзывов (2GIS/Yandex)
- Платежи: mock-провайдер (по умолчанию) и YooKassa (опционально). Конфиг через `PAYMENT_PROVIDER`

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

## Frontend: framer-motion + Tailwind

### Правило: никогда не ставить `transition-all` на `motion.*` элемент
Tailwind-класс `transition-all` (а также `transition-opacity`, `transition-transform`)
накладывает CSS-переход на ВСЕ свойства, включая `opacity` и `transform`. Если на том
же элементе framer-motion анимирует `opacity` / `y` / `scale` / `whileHover`, CSS-переход
перехватывает каждое JS-обновление инлайн-стилей и накладывает свой лерп поверх — в
результате `opacity` и `transform` рассинхронизируются (визуально: «сначала появилось,
потом поехало»), а hover-эффекты дёргаются.

**Правильно:**
- На `motion.*` элементах — только точечные переходы: `transition-colors`,
  `transition-shadow`, либо `transition-[box-shadow,background-color]`.
- Hover-подъём / scale / любые transform-эффекты — через `whileHover={{ y: -4 }}`
  с **вложенным** `transition: { duration: 0.2, ease: "easeOut" }`, иначе hover
  унаследует `delay` от entrance-анимации.

**Безопасно (не считается нарушением):**
- `transition-all` на ОБЫЧНОМ HTML-элементе, который лежит ВНУТРИ `motion.*` родителя.
  Framer ставит inline-стили только на сам родитель, дочерние CSS-свойства не меняются,
  CSS-переход у ребёнка не триггерится.

### Правило: никогда не ставить `opacity` на ПРЕДКА элемента с `backdrop-filter`
Известный баг Chromium: при `opacity < 1` на любом предке `backdrop-filter` на потомке
просто не считается, а резко «включается» когда opacity доходит до 1. Виден как
скачок яркости/блюра в финале анимации.

**Правильно:**
- `opacity` и `backdrop-filter` (`backdrop-blur-*`) должны жить на ОДНОМ И ТОМ ЖЕ
  элементе — тогда Chromium считает корректно (сначала сэмпл фона → блюр → opacity
  поверх готового результата).
- Для дополнительной страховки на этот элемент — `style={{ willChange: "transform, opacity" }}`,
  чтобы он гарантированно жил на отдельном композитном слое.
