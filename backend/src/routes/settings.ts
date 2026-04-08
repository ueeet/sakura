import { Router } from "express";
import { requireAdmin } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../middleware/asyncHandler";
import { updateSettingsSchema } from "../lib/validators";
import prisma from "../prismaClient";

const router = Router();

router.get("/", requireAdmin, asyncHandler(async (_req, res) => {
  let settings = await prisma.settings.findUnique({ where: { id: 1 } });
  if (!settings) {
    settings = await prisma.settings.create({ data: {} });
  }
  res.json(settings);
}));

router.put("/", requireAdmin, validate(updateSettingsSchema), asyncHandler(async (req, res) => {
  const settings = await prisma.settings.upsert({
    where: { id: 1 },
    update: req.body,
    create: req.body,
  });
  res.json(settings);
}));

export default router;
