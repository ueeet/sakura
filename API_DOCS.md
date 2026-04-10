# API Documentation — Сакура

Base URL: `http://localhost:4000/api`

Все ответы JSON. Авторизация через `Authorization: Bearer <accessToken>` (для admin-эндпоинтов).

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
Создание первого админа (только если БД пуста).

---

## Филиалы (Branches)

### GET `/branches`
Список активных филиалов (публичный, кеш 120с).

### GET `/branches/:slug`
Филиал + сауны. **Если у филиала есть категории — сауны сгруппированы по ним.**

```json
Response: {
  "id": 1,
  "slug": "complex-9",
  "name": "Сауна 9 комплекс",
  "address": "пр. Мира, д. 9/04А",
  "phone": "+7 (927) 465-1000",
  "description": "...",
  "latitude": 55.7387,
  "longitude": 52.4063,
  "categories": [
    {
      "id": 1,
      "slug": "family",
      "name": "Семейная сауна",
      "sortOrder": 1,
      "saunas": [ /* Sauna[] */ ]
    },
    {
      "id": 2,
      "slug": "regular",
      "name": "Обычная сауна",
      "sortOrder": 2,
      "saunas": [ /* Sauna[] */ ]
    }
  ],
  "saunas": []   // сауны без категории (пусто если все сгруппированы)
}
```

Для филиала **без категорий** (например `complex-50`):
```json
Response: {
  "id": 2,
  "slug": "complex-50",
  ...,
  "categories": [],
  "saunas": [ /* все сауны филиала */ ]
}
```

### POST / PUT / DELETE `/branches[/:id]` (Admin) — CRUD

---

## Категории саун (SaunaCategory)

### GET `/categories?branchId=1`
Список категорий, опционально по филиалу.

### POST `/categories` (Admin)
```json
Request: { "slug": "family", "name": "Семейная сауна", "branchId": 1, "sortOrder": 0 }
```

### PUT / DELETE `/categories/:id` (Admin)

---

## Сауны (Saunas)

### GET `/saunas`
Фильтры: `?branchId=1`, `?categoryId=2`, `?type=russian|finnish|hamam`.

```json
Response: [
  {
    "id": 1,
    "slug": "complex-9-family-1",
    "name": "Сауна №1",
    "type": "finnish",
    "typeLabel": "Финская сауна",
    "size": "small",
    "sizeLabel": "С джакузи",
    "description": "...",
    "capacity": 6,
    "area": null,
    "poolSize": null,
    "hasBBQ": false,
    "mainImage": "/images/saunas/complex-9/family/1/2.webp",
    "images": ["/images/.../1.webp", "/images/.../2.webp"],
    "amenities": ["Комната отдыха", "Сауна", "Wi-Fi", ...],
    "extras": ["Массажное кресло"],
    "isActive": true,
    "cleaningMinutes": 60,
    "minHours": 2,
    "openHour": 0,
    "closeHour": 24,
    "branchId": 1,
    "categoryId": 1,
    "branch": { "id": 1, "slug": "complex-9", "name": "Сауна 9 комплекс" },
    "category": { "id": 1, "slug": "family", "name": "Семейная сауна" },
    "prices": [
      { "id": 1, "saunaId": 1, "dayType": "weekday", "timeSlot": "day", "pricePerHour": 800, "minHours": 2 },
      ...
    ],
    "priceFrom": 800
  }
]
```

`priceFrom` — минимальная цена за час среди всех ценовых слотов. Удобно для отображения "от 800₽".

### GET `/saunas/:slug`
Детальная сауна (по slug).

### GET `/saunas/:id/availability?date=YYYY-MM-DD`
Занятые интервалы и почасовые слоты.

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
      "end": "2026-04-15T14:00:00.000Z",
      "cleaningEnd": "2026-04-15T15:00:00.000Z"
    }
  ],
  "slots": [
    { "hour": 0, "available": true },
    { "hour": 1, "available": true },
    ...
    { "hour": 11, "available": false, "reason": "booked" },
    { "hour": 12, "available": false, "reason": "booked" },
    { "hour": 13, "available": false, "reason": "booked" },
    { "hour": 14, "available": false, "reason": "cleaning" },
    { "hour": 15, "available": true },
    ...
  ]
}
```

`slots` — массив 24 элементов, по часам. `reason`:
- `"booked"` — занято бронью
- `"cleaning"` — занято уборкой
- `"closed"` — вне рабочих часов сауны

### POST / PUT / DELETE `/saunas[/:id]` (Admin) — CRUD

POST принимает все поля сауны включая `images: string[]`, `amenities: string[]`, `extras: string[]`, `categoryId` (nullable).

---

## Цены (PriceSlot)

### GET `/prices?saunaId=1`
### POST / PUT / DELETE `/prices[/:id]` (Admin)

`dayType`: `weekday | weekend`
`timeSlot`: `day` (09–15) | `evening` (15–00) | `night` (00–09)

---

## Акции (Promotions)

### GET `/promotions`
Активные акции (публичный, кеш 120с).

```json
Response: [
  {
    "id": 1,
    "slug": "promo-1",
    "title": "Сауны от 800 ₽",
    "description": "С понедельника по пятницу с 9:00 до 15:00",
    "note": "Кроме предпраздничных и праздничных выходных",
    "icon": "flame",
    "image": null,
    "promoCode": null,
    "discount": null,
    "startDate": null,
    "endDate": null,
    "isActive": true,
    "sortOrder": 1
  }
]
```

`startDate` опциональна — для бессрочных акций. `icon` — имя иконки lucide (`flame`, `gift`, `cake`, ...).

### GET `/promotions/all` (Admin)
### GET `/promotions/:slug`
### POST / PUT / DELETE `/promotions[/:id]` (Admin)

---

## Бронирования (Bookings)

### GET `/bookings` (Admin)
Фильтры: `?status=...`, `?branchId=...`.

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
    "branch": { /* Branch */ },
    "sauna": { /* Sauna */ }
  }
]
```

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

**Валидация:**
- `startAt < endAt`
- `startAt > now`
- `endAt - startAt >= sauna.minHours`
- Проверка конфликта: новое время не пересекается с `[existing.startAt, existing.endAt + cleaningMinutes]`

**Ошибки:**
- `400` — валидация (`"Нельзя бронировать в прошлом"`, `"Минимальное время — N ч."`)
- `404` — сауна не найдена
- `409` — `"Выбранное время уже занято"` (конфликт)

**Side effects:** SSE broadcast → Telegram-уведомление → SMS клиенту.

### PUT `/bookings/:id` (Admin)
Обновление, включая смену времени (та же проверка конфликтов).

### DELETE `/bookings/:id` (Admin)

---

## Отзывы / Загрузка / Стата / Настройки / SSE / Health

### GET `/reviews`
Одобренные отзывы (публичный).

### POST `/upload` (Admin) → `{ url }`
multipart/form-data, поле `file`. Ресайз → WebP → Supabase Storage.

### GET `/stats` (Admin)
```json
{
  "bookings": { "total": 0, "new": 0, "confirmed": 0 },
  "branches": 0,
  "saunas": 0,
  "promotions": 0,
  "reviews": { "total": 0, "pending": 0 }
}
```

### GET / PUT `/settings` (Admin)
Поля: `companyName`, `mainPhone`, `email`, `vk`, `instagram`, `telegramChatId`, `smsEnabled`.

### GET `/events` — SSE realtime
События: `new_booking`, `booking_updated`, `booking_deleted`, `new_review`.

### GET `/health` → `{ status: "ok", uptime }`
