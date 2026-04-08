import { Router } from "express";
import { requireAdmin } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../middleware/asyncHandler";
import { createPortfolioSchema, updatePortfolioSchema } from "../lib/validators";
import { sanitizeObject } from "../lib/sanitize";
import { cacheGet, cacheSet, cacheInvalidate } from "../lib/cache";
import prisma from "../prismaClient";

const router = Router();

router.get("/", asyncHandler(async (_req, res) => {
  const cacheKey = "portfolio:list";
  const cached = cacheGet(cacheKey);
  if (cached) return res.json(cached);

  const data = await prisma.portfolioWork.findMany({
    include: { staff: true },
    orderBy: { createdAt: "desc" },
  });
  cacheSet(cacheKey, data, 60_000);
  res.json(data);
}));

router.get("/:id", asyncHandler(async (req, res) => {
  const item = await prisma.portfolioWork.findUnique({
    where: { id: Number(req.params.id) },
    include: { staff: true },
  });
  if (!item) { res.status(404).json({ error: "Не найдено" }); return; }
  res.json(item);
}));

router.post("/", requireAdmin, validate(createPortfolioSchema), asyncHandler(async (req, res) => {
  const clean = sanitizeObject(req.body);
  const item = await prisma.portfolioWork.create({ data: clean, include: { staff: true } });
  cacheInvalidate("portfolio:");
  res.status(201).json(item);
}));

router.put("/:id", requireAdmin, validate(updatePortfolioSchema), asyncHandler(async (req, res) => {
  const clean = sanitizeObject(req.body);
  const item = await prisma.portfolioWork.update({
    where: { id: Number(req.params.id) },
    data: clean,
    include: { staff: true },
  });
  cacheInvalidate("portfolio:");
  res.json(item);
}));

router.delete("/:id", requireAdmin, asyncHandler(async (req, res) => {
  await prisma.portfolioWork.delete({ where: { id: Number(req.params.id) } });
  cacheInvalidate("portfolio:");
  res.json({ success: true });
}));

export default router;
