import { Router } from "express";
import { requireAdmin } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../middleware/asyncHandler";
import { createBranchSchema, updateBranchSchema } from "../lib/validators";
import { sanitizeObject } from "../lib/sanitize";
import { cacheGet, cacheSet, cacheInvalidate } from "../lib/cache";
import prisma from "../prismaClient";

const router = Router();

router.get("/", asyncHandler(async (_req, res) => {
  const cacheKey = "branches:list";
  const cached = cacheGet(cacheKey);
  if (cached) return res.json(cached);

  const data = await prisma.branch.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });
  cacheSet(cacheKey, data, 120_000);
  res.json(data);
}));

router.get("/:slug", asyncHandler(async (req, res) => {
  const branch = await prisma.branch.findUnique({
    where: { slug: req.params.slug },
    include: {
      saunas: {
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
        include: {
          images: { orderBy: { sortOrder: "asc" } },
          amenities: true,
          prices: true,
        },
      },
    },
  });
  if (!branch) { res.status(404).json({ error: "Филиал не найден" }); return; }
  res.json(branch);
}));

router.post("/", requireAdmin, validate(createBranchSchema), asyncHandler(async (req, res) => {
  const clean = sanitizeObject(req.body);
  const item = await prisma.branch.create({ data: clean });
  cacheInvalidate("branches:");
  res.status(201).json(item);
}));

router.put("/:id", requireAdmin, validate(updateBranchSchema), asyncHandler(async (req, res) => {
  const clean = sanitizeObject(req.body);
  const item = await prisma.branch.update({
    where: { id: Number(req.params.id) },
    data: clean,
  });
  cacheInvalidate("branches:");
  res.json(item);
}));

router.delete("/:id", requireAdmin, asyncHandler(async (req, res) => {
  await prisma.branch.delete({ where: { id: Number(req.params.id) } });
  cacheInvalidate("branches:");
  res.json({ success: true });
}));

export default router;
