import { Router } from "express";
import { requireAdmin } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../middleware/asyncHandler";
import { createCategorySchema, updateCategorySchema } from "../lib/validators";
import { sanitizeObject } from "../lib/sanitize";
import { cacheInvalidate } from "../lib/cache";
import prisma from "../prismaClient";

const router = Router();

router.get("/", asyncHandler(async (req, res) => {
  const branchId = req.query.branchId ? Number(req.query.branchId) : undefined;
  const data = await prisma.saunaCategory.findMany({
    where: { ...(branchId && { branchId }) },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });
  res.json(data);
}));

router.post("/", requireAdmin, validate(createCategorySchema), asyncHandler(async (req, res) => {
  const clean = sanitizeObject(req.body);
  const item = await prisma.saunaCategory.create({ data: clean });
  cacheInvalidate("branches:");
  cacheInvalidate("saunas:");
  res.status(201).json(item);
}));

router.put("/:id", requireAdmin, validate(updateCategorySchema), asyncHandler(async (req, res) => {
  const clean = sanitizeObject(req.body);
  const item = await prisma.saunaCategory.update({
    where: { id: Number(req.params.id) },
    data: clean,
  });
  cacheInvalidate("branches:");
  cacheInvalidate("saunas:");
  res.json(item);
}));

router.delete("/:id", requireAdmin, asyncHandler(async (req, res) => {
  await prisma.saunaCategory.delete({ where: { id: Number(req.params.id) } });
  cacheInvalidate("branches:");
  cacheInvalidate("saunas:");
  res.json({ success: true });
}));

export default router;
