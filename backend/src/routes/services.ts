import { Router } from "express";
import { requireAdmin } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../middleware/asyncHandler";
import { createServiceSchema, updateServiceSchema } from "../lib/validators";
import { sanitizeObject } from "../lib/sanitize";
import { cacheGet, cacheSet, cacheInvalidate } from "../lib/cache";
import prisma from "../prismaClient";

const router = Router();

router.get("/", asyncHandler(async (_req, res) => {
  const cacheKey = "services:list";
  const cached = cacheGet(cacheKey);
  if (cached) return res.json(cached);

  const data = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });
  cacheSet(cacheKey, data, 60_000);
  res.json(data);
}));

router.get("/:id", asyncHandler(async (req, res) => {
  const item = await prisma.service.findUnique({ where: { id: Number(req.params.id) } });
  if (!item) { res.status(404).json({ error: "Не найдено" }); return; }
  res.json(item);
}));

router.post("/", requireAdmin, validate(createServiceSchema), asyncHandler(async (req, res) => {
  const clean = sanitizeObject(req.body);
  const item = await prisma.service.create({ data: clean });
  cacheInvalidate("services:");
  res.status(201).json(item);
}));

router.put("/:id", requireAdmin, validate(updateServiceSchema), asyncHandler(async (req, res) => {
  const clean = sanitizeObject(req.body);
  const item = await prisma.service.update({
    where: { id: Number(req.params.id) },
    data: clean,
  });
  cacheInvalidate("services:");
  res.json(item);
}));

router.delete("/:id", requireAdmin, asyncHandler(async (req, res) => {
  await prisma.service.delete({ where: { id: Number(req.params.id) } });
  cacheInvalidate("services:");
  res.json({ success: true });
}));

export default router;
