# API Documentation — Сакура

Base URL: `http://localhost:4000/api`

Все ответы в JSON. Авторизация через `Authorization: Bearer <accessToken>` (только для admin-эндпоинтов).

---

## Аутентификация

### POST `/auth/login`
```json
Request:  { "login": "string", "password": "string" }
Response: { "accessToken": "string", "refreshToken": "string" }
```

### POST `/auth/refresh`
```json
Request:  { "refreshToken": "string" }
Response: { "accessToken": "string", "refreshToken": "string" }
```

### POST `/auth/setup`
Создание первого админа (работает только если в БД нет ни одного админа).
```json
Request:  { "login": "string", "password": "string" }
Response: { "accessToken": "string", "refreshToken": "string" }
```

---

## Филиалы (Branches)

### GET `/branches`
Список активных филиалов (публичный, кеш 120с).
```json
Response: [
  {
    "id": 1,
    "slug": "complex-9",
    "name": "9-й комплекс (Новый город)",
    "address": "пр-т Мира, 9/04А",
    "phone": "+7 (8552) 782-000",
    "description": "...",
    "latitude": 55.7387,
    "longitude": 52.4063,
    "coverImage": null,
    "tourUrl": null,
    "workingHours": null,
    "isActive": true,
    "sortOrder": 1
  }
]
```

### GET `/branches/:slug`
Филиал по slug + все его сауны (с фото, удобствами, ценами).

### POST `/branches` (Admin)
```json
Request: {
  "slug": "string",
  "name": "string",
  "address": "string",
  "phone": "string",
  "description": "string?",
  "latitude": 0,
  "longitude": 0,
  "coverImage": "string?",
  "tourUrl": "string?",
  "workingHours": {}?,
  "sortOrder": 0
}
```

### PUT `/branches/:id` (Admin)
### DELETE `/branches/:id` (Admin)

---

## Сауны (Saunas)

### GET `/saunas`
Список саун. Фильтры:
- `?branchId=1` — только из конкретного филиала
- `?type=russian|finnish|hammam` — по типу

```json
Response: [
  {
    "id": 1,
    "slug": "russkaya-banya-1",
    "name": "Русская баня №1",
    "type": "russian",
    "description": "...",
    "capacity": 8,
    "area": 60,
    "hasPool": true,
    "hasBBQ": true,
    "cleaningMinutes": 60,
    "minHours": 2,
    "openHour": 0,
    "closeHour": 24,
    "branch": { "id": 1, "slug": "complex-9", "name": "9-й комплекс" },
    "images": [{ "id": 1, "url": "...", "alt": "...", "sortOrder": 0 }],
    "amenities": [{ "id": 1, "name": "Бассейн с гейзером", "icon": "waves" }],
    "prices": [{ "dayType": "weekday", "timeSlot": "day", "pricePerHour": 1000, "minHours": 2 }]
  }
]
```

### GET `/saunas/:slug`
Сауна по slug со всеми связанными данными.

### GET `/saunas/:id/availability?date=YYYY-MM-DD`
Занятые интервалы сауны на указанный день. Используется фронтом для отрисовки таймлайна и валидации формы бронирования.

```json
Response: {
  "date": "2026-04-15",
  "saunaId": 1,
  "openHour": 0,
  "closeHour": 24,
  "minHours": 2,
  "cleaningMinutes": 60,
  "occupied": [
    {
      "bookingId": 12,
      "start": "2026-04-15T11:00:00.000Z",
      "end":   "2026-04-15T14:00:00.000Z",
      "cleaningEnd": "2026-04-15T15:00:00.000Z"
    }
  ]
}
```

`cleaningEnd = end + cleaningMinutes`. Любая новая бронь не должна пересекаться с интервалом `[start, cleaningEnd]`.

### POST `/saunas` (Admin)
```json
Request: {
  "slug": "string",
  "name": "string",
  "type": "russian|finnish|hammam",
  "description": "string?",
  "capacity": 1,
  "area": 0?,
  "hasPool": false,
  "hasBBQ": false,
  "cleaningMinutes": 60,
  "minHours": 2,
  "openHour": 0,
  "closeHour": 24,
  "branchId": 1,
  "sortOrder": 0
}
```

### PUT `/saunas/:id` (Admin)
### DELETE `/saunas/:id` (Admin)

---

## Цены (PriceSlot)

### GET `/prices?saunaId=1`
Все ценовые слоты. Опционально фильтр по сауне.

```json
Response: [
  { "id": 1, "saunaId": 1, "dayType": "weekday", "timeSlot": "day", "pricePerHour": 1000, "minHours": 2 }
]
```

`dayType`: `weekday` | `weekend`
`timeSlot`: `day` (09–15) | `evening` (15–00) | `night` (00–09)

### POST `/prices` (Admin)
```json
Request: { "saunaId": 1, "dayType": "weekday", "timeSlot": "day", "pricePerHour": 1000, "minHours": 2 }
```

### PUT `/prices/:id` (Admin)
### DELETE `/prices/:id` (Admin)

---

## Акции (Promotions)

### GET `/promotions`
Активные акции (публичный, кеш 120с). Фильтрация по `isActive=true`, `startDate <= now`, `endDate >= now OR null`.

```json
Response: [
  {
    "id": 1,
    "slug": "birthday-discount",
    "title": "Скидка 10% в день рождения",
    "description": "...",
    "image": null,
    "promoCode": null,
    "discount": 10,
    "startDate": "2026-01-01T00:00:00.000Z",
    "endDate": "2026-12-31T00:00:00.000Z",
    "isActive": true,
    "sortOrder": 1
  }
]
```

### GET `/promotions/all` (Admin)
Все акции, включая неактивные и просроченные.

### GET `/promotions/:slug`
Акция по slug.

### POST `/promotions` (Admin)
```json
Request: {
  "slug": "string",
  "title": "string",
  "description": "string",
  "image": "string?",
  "promoCode": "string?",
  "discount": 10?,
  "startDate": "ISO date string",
  "endDate": "ISO date string?",
  "sortOrder": 0
}
```

### PUT `/promotions/:id` (Admin)
### DELETE `/promotions/:id` (Admin)

---

## Бронирования (Bookings)

### GET `/bookings` (Admin)
Все бронирования. Фильтры: `?status=new|confirmed|cancelled|completed`, `?branchId=1`.

```json
Response: [
  {
    "id": 1,
    "clientName": "Иван",
    "phone": "+7 999 123-45-67",
    "startAt": "2026-04-15T11:00:00.000Z",
    "endAt": "2026-04-15T14:00:00.000Z",
    "guests": 6,
    "comment": "...",
    "status": "new",
    "totalPrice": 4200,
    "smsSent": false,
    "branch": {...},
    "sauna": {...},
    "createdAt": "..."
  }
]
```

### GET `/bookings/:id` (Admin)

### POST `/bookings`
Создание бронирования (публичный, rate-limit: 10/30мин).

```json
Request: {
  "clientName": "string",
  "phone": "string",
  "startAt": "2026-04-15T11:00:00.000Z",
  "endAt": "2026-04-15T14:00:00.000Z",
  "guests": 6,
  "comment": "string?",
  "branchId": 1,
  "saunaId": 1,
  "totalPrice": 4200
}
```

**Валидация на бэке:**
- `startAt < endAt`
- `startAt > now` (нельзя в прошлом)
- `endAt - startAt >= sauna.minHours` (минимум часов)
- **Проверка конфликта:** новое время не должно пересекаться с `[existing.startAt, existing.endAt + cleaningMinutes]` других актуальных броней той же сауны

**Возможные ошибки:**
- `400` — `"Неверный формат даты"`, `"Время окончания должно быть позже времени начала"`, `"Нельзя бронировать в прошлом"`, `"Минимальное время бронирования — N ч."`
- `404` — `"Сауна не найдена"`
- **`409`** — `"Выбранное время уже занято"` ← конфликт с уборкой

**Side effects при успехе:**
1. SSE broadcast `new_booking` → админка обновляется
2. Telegram-уведомление с inline-кнопками "Подтвердить"/"Отклонить"
3. SMS клиенту через sms.ru

### PUT `/bookings/:id` (Admin)
```json
Request: {
  "status": "new|confirmed|cancelled|completed",
  "startAt": "ISO?",
  "endAt": "ISO?",
  "guests": 0?,
  "comment": "string?",
  "totalPrice": 0?
}
```
Если меняется `startAt`/`endAt` — те же проверки конфликта (исключая саму бронь). При смене статуса на `confirmed`/`cancelled` отправляется SMS.

### DELETE `/bookings/:id` (Admin)

---

## Отзывы (Reviews)

### GET `/reviews`
Одобренные и видимые отзывы (публичный, кеш 120с).

```json
Response: [
  { "id": 1, "authorName": "string", "text": "string", "rating": 5, "source": "site|2gis|yandex", "branchId": 1?, "createdAt": "..." }
]
```

### GET `/reviews/all` (Admin)
Все отзывы (включая не модерированные из 2GIS/Yandex).

### PUT `/reviews/:id` (Admin)
```json
Request: { "isApproved": true, "isVisible": true }
```

### DELETE `/reviews/:id` (Admin)

---

## Загрузка файлов

### POST `/upload` (Admin)
multipart/form-data, поле `file`. Картинка конвертится в WebP (600px, q=82) и заливается в Supabase Storage bucket `photos`.

```json
Response: { "url": "https://...supabase.co/storage/v1/object/public/photos/<filename>.webp" }
```

---

## Статистика

### GET `/stats` (Admin)
```json
Response: {
  "bookings": { "total": 0, "new": 0, "confirmed": 0 },
  "branches": 0,
  "saunas": 0,
  "promotions": 0,
  "reviews": { "total": 0, "pending": 0 }
}
```

---

## Настройки

### GET `/settings` (Admin)
### PUT `/settings` (Admin)
```json
Request: {
  "companyName": "string?",
  "mainPhone": "string?",
  "email": "string?",
  "vk": "string?",
  "instagram": "string?",
  "telegramChatId": "string?",
  "smsEnabled": true
}
```

---

## SSE Realtime

### GET `/events`
Server-Sent Events stream. События:
- `new_booking` — новая бронь
- `booking_updated` — обновление брони (включая action из Telegram)
- `booking_deleted` — удаление
- `new_review` — новый отзыв (из парсера 2GIS/Yandex)

Heartbeat каждые 30с.

---

## Health

### GET `/health`
```json
Response: { "status": "ok", "uptime": 123.45 }
```
