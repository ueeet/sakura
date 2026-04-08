import { Router } from "express";
import { requireAdmin } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../middleware/asyncHandler";
import { createBookingSchema, updateBookingSchema } from "../lib/validators";
import { sanitizeObject } from "../lib/sanitize";
import { broadcast } from "../lib/sse";
import { notifyNewBooking } from "../lib/telegram";
import { sendBookingCreatedSms, sendBookingConfirmedSms, sendBookingCancelledSms } from "../lib/sms";
import prisma from "../prismaClient";

const router = Router();

router.get("/", requireAdmin, asyncHandler(async (_req, res) => {
  const data = await prisma.booking.findMany({
    include: { staff: true, service: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(data);
}));

router.get("/:id", requireAdmin, asyncHandler(async (req, res) => {
  const item = await prisma.booking.findUnique({
    where: { id: Number(req.params.id) },
    include: { staff: true, service: true },
  });
  if (!item) { res.status(404).json({ error: "Не найдено" }); return; }
  res.json(item);
}));

router.post("/", validate(createBookingSchema), asyncHandler(async (req, res) => {
  const clean = sanitizeObject(req.body);
  const item = await prisma.booking.create({
    data: {
      ...clean,
      date: new Date(clean.date as string),
    },
    include: { staff: true, service: true },
  });

  broadcast("new_booking", item);
  notifyNewBooking(item);
  sendBookingCreatedSms(item.phone, item.clientName);

  res.status(201).json(item);
}));

router.put("/:id", requireAdmin, validate(updateBookingSchema), asyncHandler(async (req, res) => {
  const clean = sanitizeObject(req.body);
  if (clean.date) (clean as Record<string, unknown>).date = new Date(clean.date as string);

  const item = await prisma.booking.update({
    where: { id: Number(req.params.id) },
    data: clean,
    include: { staff: true, service: true },
  });

  broadcast("booking_updated", item);

  if (req.body.status === "confirmed") {
    const dateStr = new Date(item.date).toLocaleDateString("ru-RU");
    sendBookingConfirmedSms(item.phone, item.clientName, dateStr, item.time);
  } else if (req.body.status === "cancelled") {
    sendBookingCancelledSms(item.phone, item.clientName);
  }

  res.json(item);
}));

router.delete("/:id", requireAdmin, asyncHandler(async (req, res) => {
  await prisma.booking.delete({ where: { id: Number(req.params.id) } });
  broadcast("booking_deleted", { id: Number(req.params.id) });
  res.json({ success: true });
}));

export default router;
