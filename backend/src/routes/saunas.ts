import { Router } from "express";
import { requireAdmin } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../middleware/asyncHandler";
import { createSaunaSchema, updateSaunaSchema } from "../lib/validators";
import { sanitizeObject } from "../lib/sanitize";
import { cacheGet, cacheSet, cacheInvalidate } from "../lib/cache";
import { getSaunaAvailability } from "../lib/booking";
import { parseMoscowDate } from "../lib/timezone";
import prisma from "../prismaClient";

const router = Router();

type SaunaWithPrices = {
  id: number;
  prices?: { pricePerHour: number }[];
  [key: string]: unknown;
};

function withPriceFrom<T extends SaunaWithPrices>(s: T): T & { priceFrom: number | null } {
  const min = s.prices && s.prices.length > 0
    ? Math.min(...s.prices.map((p) => p.pricePerHour))
    : null;
  return { ...s, priceFrom: min };
}

router.get("/", asyncHandler(async (req, res) => {
  const branchId = req.query.branchId ? Number(req.query.branchId) : undefined;
  const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
  const type = typeof req.query.type === "string" ? req.query.type : undefined;
  const cacheKey = `saunas:list:${branchId ?? "all"}:${categoryId ?? "all"}:${type ?? "all"}`;
  const cached = cacheGet(cacheKey);
  if (cached) return res.json(cached);

  const data = await prisma.sauna.findMany({
    where: {
      isActive: true,
      ...(branchId && { branchId }),
      ...(categoryId && { categoryId }),
      ...(type && { type }),
    },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    include: {
      branch: { select: { id: true, slug: true, name: true } },
      category: { select: { id: true, slug: true, name: true } },
      prices: true,
    },
  });
  const result = data.map(withPriceFrom);
  cacheSet(cacheKey, result, 60_000);
  res.json(result);
}));

router.get("/:slug", asyncHandler(async (req, res) => {
  const sauna = await prisma.sauna.findUnique({
    where: { slug: String(req.params.slug) },
    include: {
      branch: true,
      category: true,
      prices: true,
    },
  });
  if (!sauna) { res.status(404).json({ error: "Сауна не найдена" }); return; }
  res.json(withPriceFrom(sauna));
}));

/**
 * Batch-проверка свободности всех активных саун на интервал [startHour, endHour).
 * Используется на странице /search чтобы быстро отфильтровать сауны под выбранную
 * дату/время без N запросов /:id/availability.
 *
 * Логика повторяет hasBookingConflict, но за один SQL-проход:
 *   - грузим все не-отменённые брони указанных саун, чьи start попадают в окно
 *   - для каждой сауны локально проверяем пересечение с [start, end+cleaning]
 *   - дополнительно фильтруем сауны, у которых [startHour, endHour] вне [open, close]
 *
 * Ответ: { available: { [saunaId]: boolean } } — true если сауна свободна.
 */
router.get("/availability/batch", asyncHandler(async (req, res) => {
  const date = typeof req.query.date === "string" ? req.query.date : "";
  const startHour = Number(req.query.startHour);
  const endHour = Number(req.query.endHour);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    res.status(400).json({ error: "Параметр date обязателен (YYYY-MM-DD)" });
    return;
  }
  if (!Number.isInteger(startHour) || !Number.isInteger(endHour) ||
      startHour < 0 || endHour > 24 || endHour <= startHour) {
    res.status(400).json({ error: "startHour/endHour: целые 0..24, end > start" });
    return;
  }

  const dayStart = parseMoscowDate(date);
  dayStart.setHours(0, 0, 0, 0);
  const startAt = new Date(dayStart);
  startAt.setHours(startHour, 0, 0, 0);
  const endAt = new Date(dayStart);
  endAt.setHours(endHour, 0, 0, 0);

  const saunas = await prisma.sauna.findMany({
    where: { isActive: true },
    select: {
      id: true, cleaningMinutes: true, openHour: true, closeHour: true,
    },
  });

  // Окно для подгрузки потенциально конфликтующих броней — endAt + max(cleaning)
  const maxCleaningMs = saunas.reduce(
    (max: number, s: { cleaningMinutes: number }) => Math.max(max, s.cleaningMinutes), 0,
  ) * 60_000;
  const lookEnd = new Date(endAt.getTime() + maxCleaningMs);

  const bookings = await prisma.booking.findMany({
    where: {
      saunaId: { in: saunas.map((s: { id: number }) => s.id) },
      status: { not: "cancelled" },
      startAt: { lt: lookEnd },
    },
    select: { saunaId: true, startAt: true, endAt: true },
  });

  const bookingsBySauna = new Map<number, typeof bookings>();
  for (const b of bookings) {
    const list = bookingsBySauna.get(b.saunaId) ?? [];
    list.push(b);
    bookingsBySauna.set(b.saunaId, list);
  }

  const available: Record<number, boolean> = {};
  for (const s of saunas) {
    if (startHour < s.openHour || endHour > s.closeHour) {
      available[s.id] = false;
      continue;
    }
    const cleaningMs = s.cleaningMinutes * 60_000;
    const slotEnd = new Date(endAt.getTime() + cleaningMs);
    let conflict = false;
    for (const b of bookingsBySauna.get(s.id) ?? []) {
      if (b.startAt >= slotEnd) continue;
      const existingEnd = new Date(b.endAt.getTime() + cleaningMs);
      if (existingEnd > startAt) { conflict = true; break; }
    }
    available[s.id] = !conflict;
  }

  res.json({ available });
}));

router.get("/:id/availability", asyncHandler(async (req, res) => {
  const saunaId = Number(req.params.id);
  const date = typeof req.query.date === "string" ? req.query.date : undefined;
  if (!date) { res.status(400).json({ error: "Параметр date обязателен (YYYY-MM-DD)" }); return; }

  const availability = await getSaunaAvailability(saunaId, date);
  if (!availability) { res.status(404).json({ error: "Сауна не найдена" }); return; }
  res.json(availability);
}));

router.post("/", requireAdmin, validate(createSaunaSchema), asyncHandler(async (req, res) => {
  const clean = sanitizeObject(req.body);
  const item = await prisma.sauna.create({ data: clean });
  cacheInvalidate("saunas:");
  cacheInvalidate("branches:");
  res.status(201).json(item);
}));

router.put("/:id", requireAdmin, validate(updateSaunaSchema), asyncHandler(async (req, res) => {
  const clean = sanitizeObject(req.body);
  const item = await prisma.sauna.update({
    where: { id: Number(req.params.id) },
    data: clean,
  });
  cacheInvalidate("saunas:");
  cacheInvalidate("branches:");
  res.json(item);
}));

router.delete("/:id", requireAdmin, asyncHandler(async (req, res) => {
  await prisma.sauna.delete({ where: { id: Number(req.params.id) } });
  cacheInvalidate("saunas:");
  cacheInvalidate("branches:");
  res.json({ success: true });
}));

export default router;
