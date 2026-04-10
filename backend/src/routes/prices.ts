import { Router } from "express";
import { requireAdmin } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../middleware/asyncHandler";
import { createPriceSlotSchema, updatePriceSlotSchema } from "../lib/validators";
import { sanitizeObject } from "../lib/sanitize";
import { cacheInvalidate } from "../lib/cache";
import prisma from "../prismaClient";

const router = Router();

router.get("/", asyncHandler(async (req, res) => {
  const saunaId = req.query.saunaId ? Number(req.query.saunaId) : undefined;
  const data = await prisma.priceSlot.findMany({
    where: { ...(saunaId && { saunaId }) },
    orderBy: [{ saunaId: "asc" }, { dayType: "asc" }, { timeSlot: "asc" }],
  });
  res.json(data);
}));

router.post("/", requireAdmin, validate(createPriceSlotSchema), asyncHandler(async (req, res) => {
  const clean = sanitizeObject(req.body);
  const item = await prisma.priceSlot.create({ data: clean });
  cacheInvalidate("saunas:");
  res.status(201).json(item);
}));

router.put("/:id", requireAdmin, validate(updatePriceSlotSchema), asyncHandler(async (req, res) => {
  const clean = sanitizeObject(req.body);
  const item = await prisma.priceSlot.update({
    where: { id: Number(req.params.id) },
    data: clean,
  });
  cacheInvalidate("saunas:");
  res.json(item);
}));

router.delete("/:id", requireAdmin, asyncHandler(async (req, res) => {
  await prisma.priceSlot.delete({ where: { id: Number(req.params.id) } });
  cacheInvalidate("saunas:");
  res.json({ success: true });
}));

export default router;
