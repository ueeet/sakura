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
    staffCount,
    servicesCount,
    portfolioCount,
    totalReviews,
    pendingReviews,
  ] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.count({ where: { status: "new" } }),
    prisma.booking.count({ where: { status: "confirmed" } }),
    prisma.staff.count({ where: { isActive: true } }),
    prisma.service.count({ where: { isActive: true } }),
    prisma.portfolioWork.count(),
    prisma.review.count(),
    prisma.review.count({ where: { isApproved: false } }),
  ]);

  res.json({
    bookings: { total: totalBookings, new: newBookings, confirmed: confirmedBookings },
    staff: staffCount,
    services: servicesCount,
    portfolio: portfolioCount,
    reviews: { total: totalReviews, pending: pendingReviews },
  });
}));

export default router;
