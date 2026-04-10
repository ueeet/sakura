import { Router } from "express";
import { requireAdmin } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../middleware/asyncHandler";
import { createPromotionSchema, updatePromotionSchema } from "../lib/validators";
import { sanitizeObject } from "../lib/sanitize";
import { cacheGet, cacheSet, cacheInvalidate } from "../lib/cache";
import prisma from "../prismaClient";

const router = Router();

router.get("/", asyncHandler(async (_req, res) => {
  const cacheKey = "promotions:public";
  const cached = cacheGet(cacheKey);
  if (cached) return res.json(cached);

  const now = new Date();
  const data = await prisma.promotion.findMany({
    where: {
      isActive: true,
      startDate: { lte: now },
      OR: [{ endDate: null }, { endDate: { gte: now } }],
    },
    orderBy: [{ sortOrder: "asc" }, { id: "desc" }],
  });
  cacheSet(cacheKey, data, 120_000);
  res.json(data);
}));

router.get("/all", requireAdmin, asyncHandler(async (_req, res) => {
  const data = await prisma.promotion.findMany({
    orderBy: [{ sortOrder: "asc" }, { id: "desc" }],
  });
  res.json(data);
}));

router.get("/:slug", asyncHandler(async (req, res) => {
  const item = await prisma.promotion.findUnique({ where: { slug: String(req.params.slug) } });
  if (!item) { res.status(404).json({ error: "Акция не найдена" }); return; }
  res.json(item);
}));

router.post("/", requireAdmin, validate(createPromotionSchema), asyncHandler(async (req, res) => {
  const clean = sanitizeObject(req.body);
  const item = await prisma.promotion.create({
    data: {
      ...clean,
      startDate: new Date(clean.startDate as string),
      endDate: clean.endDate ? new Date(clean.endDate as string) : null,
    },
  });
  cacheInvalidate("promotions:");
  res.status(201).json(item);
}));

router.put("/:id", requireAdmin, validate(updatePromotionSchema), asyncHandler(async (req, res) => {
  const clean = sanitizeObject(req.body) as Record<string, unknown>;
  if (clean.startDate) clean.startDate = new Date(clean.startDate as string);
  if (clean.endDate) clean.endDate = new Date(clean.endDate as string);

  const item = await prisma.promotion.update({
    where: { id: Number(req.params.id) },
    data: clean,
  });
  cacheInvalidate("promotions:");
  res.json(item);
}));

router.delete("/:id", requireAdmin, asyncHandler(async (req, res) => {
  await prisma.promotion.delete({ where: { id: Number(req.params.id) } });
  cacheInvalidate("promotions:");
  res.json({ success: true });
}));

export default router;
