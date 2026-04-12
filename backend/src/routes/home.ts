import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { cacheGet, cacheSet } from "../lib/cache";
import prisma from "../prismaClient";

const router = Router();

/**
 * Публичные данные главной страницы.
 * Слайды карусели «О Сакуре» хранятся в Settings.homeCarouselSlides
 * как JSON массив { title, image }[]. Админка редактирует через PUT /api/settings.
 */
router.get("/slides", asyncHandler(async (_req, res) => {
  const cacheKey = "home:slides";
  const cached = cacheGet(cacheKey);
  if (cached) return res.json(cached);

  let settings = await prisma.settings.findUnique({ where: { id: 1 } });
  if (!settings) {
    settings = await prisma.settings.create({ data: {} });
  }

  const slides = Array.isArray(settings.homeCarouselSlides)
    ? settings.homeCarouselSlides
    : [];

  cacheSet(cacheKey, slides, 120_000);
  res.json(slides);
}));

export default router;
