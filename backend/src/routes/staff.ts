import { Router } from "express";
import { requireAdmin } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../middleware/asyncHandler";
import { createStaffSchema, updateStaffSchema } from "../lib/validators";
import { sanitizeObject } from "../lib/sanitize";
import { cacheGet, cacheSet, cacheInvalidate } from "../lib/cache";
import prisma from "../prismaClient";

const router = Router();

router.get("/", asyncHandler(async (_req, res) => {
  const cacheKey = "staff:list";
  const cached = cacheGet(cacheKey);
  if (cached) return res.json(cached);

  const data = await prisma.staff.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });
  cacheSet(cacheKey, data, 60_000);
  res.json(data);
}));

router.get("/:id", asyncHandler(async (req, res) => {
  const item = await prisma.staff.findUnique({ where: { id: Number(req.params.id) } });
  if (!item) { res.status(404).json({ error: "Не найдено" }); return; }
  res.json(item);
}));

router.post("/", requireAdmin, validate(createStaffSchema), asyncHandler(async (req, res) => {
  const clean = sanitizeObject(req.body);
  const item = await prisma.staff.create({ data: clean });
  cacheInvalidate("staff:");
  res.status(201).json(item);
}));

router.put("/:id", requireAdmin, validate(updateStaffSchema), asyncHandler(async (req, res) => {
  const clean = sanitizeObject(req.body);
  const item = await prisma.staff.update({
    where: { id: Number(req.params.id) },
    data: clean,
  });
  cacheInvalidate("staff:");
  res.json(item);
}));

router.delete("/:id", requireAdmin, asyncHandler(async (req, res) => {
  await prisma.staff.delete({ where: { id: Number(req.params.id) } });
  cacheInvalidate("staff:");
  res.json({ success: true });
}));

export default router;
