import { Router } from "express";
import { requireAdmin } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../middleware/asyncHandler";
import { createSaunaSchema, updateSaunaSchema } from "../lib/validators";
import { sanitizeObject } from "../lib/sanitize";
import { cacheGet, cacheSet, cacheInvalidate } from "../lib/cache";
import { getSaunaAvailability } from "../lib/booking";
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
