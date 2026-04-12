import { Router } from "express";
import { requireAdmin } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../middleware/asyncHandler";
import { createBookingSchema, updateBookingSchema } from "../lib/validators";
import { sanitizeObject } from "../lib/sanitize";
import { broadcast } from "../lib/sse";
import { notifyNewBooking, updateBookingMessage } from "../lib/telegram";
import { sendBookingCreatedSms, sendBookingConfirmedSms, sendBookingCancelledSms } from "../lib/sms";
import { hasBookingConflict } from "../lib/booking";
import { parseMoscowDate, formatMoscowHuman } from "../lib/timezone";
import { getPaymentProvider } from "../lib/payment";
import prisma from "../prismaClient";

const router = Router();

router.get("/", requireAdmin, asyncHandler(async (req, res) => {
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const branchId = req.query.branchId ? Number(req.query.branchId) : undefined;

  // Неоплаченные брони (pending_payment) в админке НЕ показываем — клиент
  // только начал оформление, ещё не внёс депозит. Крон через 15 минут их
  // чистит. Если админу явно нужен этот статус — можно запросить
  // ?status=pending_payment.
  const data = await prisma.booking.findMany({
    where: {
      ...(status ? { status } : { status: { not: "pending_payment" } }),
      ...(branchId && { branchId }),
    },
    include: { branch: true, sauna: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(data);
}));

router.get("/:id", requireAdmin, asyncHandler(async (req, res) => {
  const item = await prisma.booking.findUnique({
    where: { id: Number(req.params.id) },
    include: { branch: true, sauna: true, payments: true },
  });
  if (!item) { res.status(404).json({ error: "Не найдено" }); return; }
  res.json(item);
}));

// Публичный read-only endpoint для страницы статуса оплаты
// Возвращает только безопасные поля
router.get("/:id/public", asyncHandler(async (req, res) => {
  const item = await prisma.booking.findUnique({
    where: { id: Number(req.params.id) },
    select: {
      id: true,
      clientName: true,
      phone: true,
      startAt: true,
      endAt: true,
      guests: true,
      status: true,
      paymentStatus: true,
      paidAmount: true,
      totalPrice: true,
      branch: { select: { id: true, slug: true, name: true } },
      sauna: { select: { id: true, slug: true, name: true } },
    },
  });
  if (!item) { res.status(404).json({ error: "Не найдено" }); return; }
  res.json(item);
}));

router.post("/", validate(createBookingSchema), asyncHandler(async (req, res) => {
  const clean = sanitizeObject(req.body);
  const startAt = parseMoscowDate(clean.startAt as string);
  const endAt = parseMoscowDate(clean.endAt as string);

  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
    res.status(400).json({ error: "Неверный формат даты" });
    return;
  }
  if (startAt >= endAt) {
    res.status(400).json({ error: "Время окончания должно быть позже времени начала" });
    return;
  }
  if (startAt < new Date()) {
    res.status(400).json({ error: "Нельзя бронировать в прошлом" });
    return;
  }

  const sauna = await prisma.sauna.findUnique({ where: { id: clean.saunaId as number } });
  if (!sauna || !sauna.isActive) {
    res.status(404).json({ error: "Сауна не найдена" });
    return;
  }

  const hours = Math.ceil((endAt.getTime() - startAt.getTime()) / 3_600_000);
  if (hours < sauna.minHours) {
    res.status(400).json({ error: `Минимальное время бронирования — ${sauna.minHours} ч.` });
    return;
  }

  const conflict = await hasBookingConflict(sauna.id, startAt, endAt, sauna.cleaningMinutes);
  if (conflict) {
    res.status(409).json({ error: "Выбранное время уже занято" });
    return;
  }

  // Тип оплаты — фронт может прислать "deposit" (по умолчанию) или "full"
  const paymentType: "deposit" | "full" =
    (clean.paymentType as "deposit" | "full") === "full" ? "full" : "deposit";

  const item = await prisma.booking.create({
    data: {
      clientName: clean.clientName as string,
      phone: clean.phone as string,
      startAt,
      endAt,
      guests: (clean.guests as number) ?? 2,
      comment: (clean.comment as string) ?? null,
      branchId: clean.branchId as number,
      saunaId: clean.saunaId as number,
      totalPrice: (clean.totalPrice as number) ?? null,
      status: "pending_payment",
      paymentStatus: "pending",
    },
    include: { branch: true, sauna: true },
  });

  // Создаём платёж: depositPercent% от totalPrice или полная сумма
  let payment = null;
  if (item.totalPrice && item.totalPrice > 0) {
    const amount = paymentType === "full"
      ? item.totalPrice
      : Math.round((item.totalPrice * (sauna.depositPercent ?? 30)) / 100);

    const provider = getPaymentProvider();
    const returnUrl = `${process.env.FRONTEND_URL}/booking/status?bookingId=${item.id}`;

    const created = await provider.createPayment({
      bookingId: item.id,
      amount,
      type: paymentType,
      description: `Бронь №${item.id} — ${sauna.name}, ${formatMoscowHuman(item.startAt)}`,
      customerPhone: item.phone,
      returnUrl,
    });

    payment = await prisma.payment.create({
      data: {
        bookingId: item.id,
        provider: provider.name,
        externalId: created.externalId,
        amount,
        type: paymentType,
        status: "pending",
        confirmationUrl: created.confirmationUrl,
      },
    });
  }

  broadcast("new_booking", item);
  notifyNewBooking(item);
  sendBookingCreatedSms(item.phone, item.clientName);

  res.status(201).json({ ...item, payment });
}));

router.put("/:id", requireAdmin, validate(updateBookingSchema), asyncHandler(async (req, res) => {
  const clean = sanitizeObject(req.body) as Record<string, unknown>;
  const id = Number(req.params.id);

  // Если меняется время — проверяем конфликты
  if (clean.startAt || clean.endAt) {
    const existing = await prisma.booking.findUnique({
      where: { id },
      include: { sauna: true },
    });
    if (!existing) { res.status(404).json({ error: "Не найдено" }); return; }

    const newStart = clean.startAt ? parseMoscowDate(clean.startAt as string) : existing.startAt;
    const newEnd = clean.endAt ? parseMoscowDate(clean.endAt as string) : existing.endAt;

    if (newStart >= newEnd) {
      res.status(400).json({ error: "Время окончания должно быть позже времени начала" });
      return;
    }

    const conflict = await hasBookingConflict(
      existing.saunaId,
      newStart,
      newEnd,
      existing.sauna.cleaningMinutes,
      id,
    );
    if (conflict) {
      res.status(409).json({ error: "Выбранное время уже занято" });
      return;
    }

    clean.startAt = newStart;
    clean.endAt = newEnd;
  }

  const item = await prisma.booking.update({
    where: { id },
    data: clean,
    include: { branch: true, sauna: true },
  });

  broadcast("booking_updated", item);

  if (req.body.status === "confirmed") {
    const dateStr = formatMoscowHuman(item.startAt);
    sendBookingConfirmedSms(item.phone, item.clientName, dateStr, "");
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
