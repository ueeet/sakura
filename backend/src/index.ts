// Все даты в API трактуются как Московское время — см. lib/timezone.ts
process.env.TZ = "Europe/Moscow";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
dotenv.config();

import { formatMoscowISO } from "./lib/timezone";
import logger from "./lib/logger";
import { addSSEClient } from "./lib/sse";
import { initTelegramBot } from "./lib/telegram";
import { initReviewParser } from "./lib/reviewParser";
import { initBookingCleanup } from "./lib/bookingCleanup";

import authRoutes from "./routes/auth";
import uploadRoutes from "./routes/upload";
import statsRoutes from "./routes/stats";
import settingsRoutes from "./routes/settings";
import branchesRoutes from "./routes/branches";
import categoriesRoutes from "./routes/categories";
import saunasRoutes from "./routes/saunas";
import pricesRoutes from "./routes/prices";
import promotionsRoutes from "./routes/promotions";
import bookingsRoutes from "./routes/bookings";
import paymentsRoutes from "./routes/payments";
import reviewsRoutes from "./routes/reviews";

const app = express();
const PORT = process.env.PORT || 4000;

// Все Date в JSON-ответах сериализуются с московским смещением (+03:00)
app.set("json replacer", function (this: Record<string, unknown>, key: string, value: unknown) {
  const original = this?.[key];
  if (original instanceof Date) {
    return formatMoscowISO(original);
  }
  return value;
});

// Безопасность
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || false, credentials: true }));
app.use(compression({
  filter: (req) => {
    if (req.url === "/api/events") return false;
    return true;
  },
}));
app.use(express.json({ limit: "1mb" }));

// Rate limiting
app.use("/api/auth/login", rateLimit({
  windowMs: 15 * 60 * 1000, max: 5,
  message: { error: "Слишком много попыток. Подождите 15 минут" },
}));
// Лимит только на создание брони клиентами (POST), не на чтение из админки
const bookingPostLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 10,
  message: { error: "Слишком много попыток создания брони. Подождите" },
});
app.use("/api/bookings", (req, res, next) => {
  if (req.method === "POST") return bookingPostLimiter(req, res, next);
  next();
});
app.use("/api", rateLimit({ windowMs: 60 * 1000, max: 200 }));

// Логирование
app.use((req, _res, next) => {
  logger.info({ method: req.method, url: req.url }, "request");
  next();
});

// Роуты
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/branches", branchesRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/saunas", saunasRoutes);
app.use("/api/prices", pricesRoutes);
app.use("/api/promotions", promotionsRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/reviews", reviewsRoutes);

// SSE
app.get("/api/events", (req, res) => addSSEClient(req, res));

// Health check
app.get("/api/health", (_req, res) => res.json({ status: "ok", uptime: process.uptime() }));

// 404 + Error handler
app.use((_req, res) => res.status(404).json({ error: "Маршрут не найден" }));
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error({ err: err.message, stack: err.stack }, "Unhandled error");
  res.status(500).json({ error: "Внутренняя ошибка сервера" });
});

app.listen(Number(PORT), "0.0.0.0", () => {
  logger.info(`Server running on port ${PORT}`);
  initTelegramBot();
  initReviewParser();
  initBookingCleanup();
});
