import { Router } from "express";
import { requireAdmin } from "../middleware/auth";
import { asyncHandler } from "../middleware/asyncHandler";
import prisma from "../prismaClient";

const router = Router();

router.get("/", requireAdmin, asyncHandler(async (_req, res) => {
  const [
    totalBookings,
    newBookings,
    confirmedBookings,
    branchesCount,
    saunasCount,
    promotionsCount,
    totalReviews,
    pendingReviews,
  ] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.count({ where: { status: "new" } }),
    prisma.booking.count({ where: { status: "confirmed" } }),
    prisma.branch.count({ where: { isActive: true } }),
    prisma.sauna.count({ where: { isActive: true } }),
    prisma.promotion.count({ where: { isActive: true } }),
    prisma.review.count(),
    prisma.review.count({ where: { isApproved: false } }),
  ]);

  res.json({
    bookings: { total: totalBookings, new: newBookings, confirmed: confirmedBookings },
    branches: branchesCount,
    saunas: saunasCount,
    promotions: promotionsCount,
    reviews: { total: totalReviews, pending: pendingReviews },
  });
}));

export default router;
