# API Documentation — Сакура

Base URL: `http://localhost:4000/api`

## Аутентификация

### POST /auth/login
Вход администратора.
```json
Request:  { "login": "string", "password": "string" }
Response: { "accessToken": "string", "refreshToken": "string" }
```

### POST /auth/refresh
Обновление токена.
```json
Request:  { "refreshToken": "string" }
Response: { "accessToken": "string", "refreshToken": "string" }
```

### POST /auth/setup
Первичная настройка админа (работает только если нет ни одного админа).
```json
Request:  { "login": "string", "password": "string" }
Response: { "accessToken": "string", "refreshToken": "string" }
```

---

## Сотрудники (Staff)

### GET /staff
Список активных сотрудников (публичный).
```json
Response: [{ "id": 1, "name": "string", "role": "string", "experience": 0, "photo": "string?", "description": "string?", "schedule": {} }]
```

### GET /staff/:id
Сотрудник по ID.

### POST /staff (Admin)
Создание сотрудника.
```json
Request: { "name": "string", "role": "string", "experience": 0, "photo": "string?", "description": "string?", "schedule": {} }
```

### PUT /staff/:id (Admin)
Обновление сотрудника.

### DELETE /staff/:id (Admin)
Удаление сотрудника.

---

## Услуги (Services)

### GET /services
Список активных услуг (публичный).
```json
Response: [{ "id": 1, "name": "string", "description": "string?", "price": 0, "duration": 30, "category": "string?" }]
```

### GET /services/:id
Услуга по ID.

### POST /services (Admin)
```json
Request: { "name": "string", "description": "string?", "price": 0, "duration": 30, "category": "string?" }
```

### PUT /services/:id (Admin)
### DELETE /services/:id (Admin)

---

## Записи (Bookings)

### GET /bookings (Admin)
Список всех записей.
```json
Response: [{ "id": 1, "clientName": "string", "phone": "string", "date": "ISO", "time": "string", "comment": "string?", "status": "new|confirmed|cancelled|completed", "staffId": 1, "serviceId": 1, "staff": {...}, "service": {...} }]
```

### POST /bookings
Создание записи (публичный).
```json
Request: { "clientName": "string", "phone": "string", "date": "ISO", "time": "string", "comment": "string?", "staffId": 1, "serviceId": 1 }
```

### PUT /bookings/:id (Admin)
Обновление записи (смена статуса).

### DELETE /bookings/:id (Admin)
Удаление записи.

---

## Портфолио (Portfolio)

### GET /portfolio
Список работ (публичный).
```json
Response: [{ "id": 1, "title": "string", "description": "string?", "beforePhoto": "string?", "afterPhoto": "string?", "category": "string?", "staffId": 1, "staff": {...} }]
```

### POST /portfolio (Admin)
```json
Request: { "title": "string", "description": "string?", "beforePhoto": "string?", "afterPhoto": "string?", "category": "string?", "staffId": 1 }
```

### PUT /portfolio/:id (Admin)
### DELETE /portfolio/:id (Admin)

---

## Отзывы (Reviews)

### GET /reviews
Список одобренных отзывов (публичный).
```json
Response: [{ "id": 1, "authorName": "string", "text": "string", "rating": 5, "source": "site|2gis|yandex" }]
```

### GET /reviews/all (Admin)
Все отзывы (включая неодобренные).

### PUT /reviews/:id (Admin)
Обновление (одобрение/скрытие).

### DELETE /reviews/:id (Admin)

---

## Загрузка файлов

### POST /upload (Admin)
Загрузка изображения (multipart/form-data, поле `file`).
```json
Response: { "url": "string" }
```

---

## Статистика

### GET /stats (Admin)
```json
Response: { "bookings": { "total": 0, "new": 0, "confirmed": 0 }, "staff": 0, "services": 0, "portfolio": 0, "reviews": { "total": 0, "pending": 0 } }
```

---

## Настройки

### GET /settings (Admin)
### PUT /settings (Admin)
```json
Request: { "companyName": "string?", "phone": "string?", "address": "string?", "workingHours": {}?, "telegramChatId": "string?", "smsEnabled": true }
```

---

## SSE

### GET /events
Server-Sent Events stream. События: `new_booking`, `booking_updated`, `booking_deleted`.

---

## Health

### GET /health
```json
Response: { "status": "ok", "uptime": 123.45 }
```
