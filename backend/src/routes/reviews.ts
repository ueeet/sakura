import { Router } from "express";
import { requireAdmin } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../middleware/asyncHandler";
import { createReviewSchema, updateReviewSchema } from "../lib/validators";
import { cacheGet, cacheSet, cacheInvalidate } from "../lib/cache";
import prisma from "../prismaClient";

const router = Router();

router.get("/", asyncHandler(async (_req, res) => {
  const cacheKey = "reviews:public";
  const cached = cacheGet(cacheKey);
  if (cached) return res.json(cached);

  const data = await prisma.review.findMany({
    where: { isApproved: true, isVisible: true },
    orderBy: { createdAt: "desc" },
  });
  cacheSet(cacheKey, data, 120_000);
  res.json(data);
}));

router.get("/all", requireAdmin, asyncHandler(async (_req, res) => {
  const data = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
  });
  res.json(data);
}));

router.post("/", requireAdmin, validate(createReviewSchema), asyncHandler(async (req, res) => {
  const item = await prisma.review.create({ data: req.body });
  cacheInvalidate("reviews:");
  res.status(201).json(item);
}));

router.put("/:id", requireAdmin, validate(updateReviewSchema), asyncHandler(async (req, res) => {
  const item = await prisma.review.update({
    where: { id: Number(req.params.id) },
    data: req.body,
  });
  cacheInvalidate("reviews:");
  res.json(item);
}));

router.delete("/:id", requireAdmin, asyncHandler(async (req, res) => {
  await prisma.review.delete({ where: { id: Number(req.params.id) } });
  cacheInvalidate("reviews:");
  res.json({ success: true });
}));

export default router;
