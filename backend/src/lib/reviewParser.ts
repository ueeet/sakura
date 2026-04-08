import axios from "axios";
import cron from "node-cron";
import logger from "./logger";
import prisma from "../prismaClient";
import { broadcast } from "./sse";

async function parseDGISReviews() {
  const apiKey = process.env.DGIS_API_KEY;
  const firmId = process.env.DGIS_FIRM_ID;
  if (!apiKey || !firmId) return;

  try {
    const res = await axios.get(`https://catalog.api.2gis.com/3.0/items/byid`, {
      params: { id: firmId, key: apiKey, fields: "items.reviews" },
    });

    const reviews = res.data?.result?.items?.[0]?.reviews?.items || [];
    for (const r of reviews) {
      const sourceId = `2gis_${r.id}`;
      const exists = await prisma.review.findUnique({ where: { sourceId } });
      if (exists) continue;

      const review = await prisma.review.create({
        data: {
          authorName: r.user?.name || "Аноним",
          text: r.text || "",
          rating: r.rating || 5,
          source: "2gis",
          sourceId,
          isApproved: false,
        },
      });
      broadcast("new_review", review);
      logger.info({ sourceId }, "New 2GIS review parsed");
    }
  } catch (err) {
    logger.error(err, "2GIS review parsing error");
  }
}

async function parseYandexReviews() {
  const orgId = process.env.YANDEX_ORG_ID;
  if (!orgId) return;

  try {
    const res = await axios.get(`https://yandex.ru/maps-reviews-widget/api/reviews`, {
      params: { business_id: orgId, limit: 20 },
    });

    const reviews = res.data?.reviews || [];
    for (const r of reviews) {
      const sourceId = `yandex_${r.reviewId}`;
      const exists = await prisma.review.findUnique({ where: { sourceId } });
      if (exists) continue;

      const review = await prisma.review.create({
        data: {
          authorName: r.author?.name || "Аноним",
          text: r.text || "",
          rating: r.rating || 5,
          source: "yandex",
          sourceId,
          isApproved: false,
        },
      });
      broadcast("new_review", review);
      logger.info({ sourceId }, "New Yandex review parsed");
    }
  } catch (err) {
    logger.error(err, "Yandex review parsing error");
  }
}

export function initReviewParser() {
  cron.schedule("0 */4 * * *", async () => {
    logger.info("Running review parser...");
    await parseDGISReviews();
    await parseYandexReviews();
  });
  logger.info("Review parser scheduled (every 4 hours)");
}
