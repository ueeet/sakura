import { Router } from "express";
import { z } from "zod/v4";
import { requireAdmin } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../middleware/asyncHandler";
import { broadcast } from "../lib/sse";
import { sendBookingConfirmedSms } from "../lib/sms";
import { formatMoscowHuman } from "../lib/timezone";
import { getPaymentProvider } from "../lib/payment";
import prisma from "../prismaClient";

const router = Router();

const createPaymentSchema = z.object({
  bookingId: z.number().int().min(1),
  type: z.enum(["deposit", "full"]),
});

const refundSchema = z.object({
  amount: z.number().int().min(0).optional(),
  reason: z.string().optional(),
});

// ========== Создание платежа ==========
router.post("/create", validate(createPaymentSchema), asyncHandler(async (req, res) => {
  const { bookingId, type } = req.body as { bookingId: number; type: "deposit" | "full" };

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { sauna: true },
  });
  if (!booking) { res.status(404).json({ error: "Бронь не найдена" }); return; }
  if (!booking.totalPrice) { res.status(400).json({ error: "У брони не указана сумма" }); return; }

  // Считаем сумму к оплате
  const amount = type === "full"
    ? booking.totalPrice
    : Math.round((booking.totalPrice * (booking.sauna.depositPercent ?? 30)) / 100);

  const provider = getPaymentProvider();
  const returnUrl = `${process.env.FRONTEND_URL}/booking/status?bookingId=${booking.id}`;

  const created = await provider.createPayment({
    bookingId: booking.id,
    amount,
    type,
    description: `Бронь №${booking.id} — ${booking.sauna.name}, ${formatMoscowHuman(booking.startAt)}`,
    customerPhone: booking.phone,
    returnUrl,
  });

  // Сохраняем платёж в БД
  const payment = await prisma.payment.create({
    data: {
      bookingId: booking.id,
      provider: provider.name,
      externalId: created.externalId,
      amount,
      type,
      status: "pending",
      confirmationUrl: created.confirmationUrl,
    },
  });

  res.status(201).json(payment);
}));

// ========== Получить статус платежа ==========
router.get("/:idOrExternalId", asyncHandler(async (req, res) => {
  const idOrExt = String(req.params.idOrExternalId);
  const payment = await prisma.payment.findFirst({
    where: {
      OR: [
        ...(Number.isFinite(Number(idOrExt)) ? [{ id: Number(idOrExt) }] : []),
        { externalId: idOrExt },
      ],
    },
    include: { booking: true },
  });
  if (!payment) { res.status(404).json({ error: "Платёж не найден" }); return; }
  res.json(payment);
}));

// ========== Mock: подтверждение оплаты (имитация webhook) ==========
router.post("/mock/confirm", asyncHandler(async (req, res) => {
  const { externalId } = req.body as { externalId?: string };
  if (!externalId) { res.status(400).json({ error: "externalId обязателен" }); return; }

  const payment = await prisma.payment.findUnique({
    where: { externalId },
    include: { booking: { include: { branch: true, sauna: true } } },
  });
  if (!payment) { res.status(404).json({ error: "Платёж не найден" }); return; }
  if (payment.status === "succeeded") { res.json(payment); return; } // идемпотентность
  if (payment.provider !== "mock") { res.status(400).json({ error: "Не mock-платёж" }); return; }

  // Обновляем платёж
  const updated = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "succeeded",
      paidAt: new Date(),
      paymentMethod: "card",
    },
  });

  // Обновляем бронь
  const newPaidAmount = payment.booking.paidAmount + payment.amount;
  const isFullyPaid = newPaidAmount >= (payment.booking.totalPrice ?? 0);

  const updatedBooking = await prisma.booking.update({
    where: { id: payment.bookingId },
    data: {
      paidAmount: newPaidAmount,
      paymentStatus: isFullyPaid ? "fully_paid" : "deposit_paid",
      status: "new", // переводим из pending_payment в new
    },
    include: { branch: true, sauna: true },
  });

  // Уведомления
  broadcast("payment_received", { payment: updated, booking: updatedBooking });
  broadcast("booking_updated", updatedBooking);

  // SMS клиенту — бронь подтверждена
  const dateStr = formatMoscowHuman(updatedBooking.startAt);
  sendBookingConfirmedSms(updatedBooking.phone, updatedBooking.clientName, dateStr, "");

  res.json({ payment: updated, booking: updatedBooking });
}));

// ========== Mock: отмена оплаты ==========
router.post("/mock/cancel", asyncHandler(async (req, res) => {
  const { externalId } = req.body as { externalId?: string };
  if (!externalId) { res.status(400).json({ error: "externalId обязателен" }); return; }

  const payment = await prisma.payment.findUnique({ where: { externalId } });
  if (!payment) { res.status(404).json({ error: "Платёж не найден" }); return; }
  if (payment.status !== "pending") { res.json(payment); return; }

  const updated = await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "canceled" },
  });

  // Отменяем бронь — слот освобождается
  await prisma.booking.update({
    where: { id: payment.bookingId },
    data: { status: "cancelled" },
  });

  broadcast("payment_canceled", updated);
  res.json(updated);
}));

// ========== Возврат (admin) ==========
router.post("/:id/refund", requireAdmin, validate(refundSchema), asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: { booking: true },
  });
  if (!payment) { res.status(404).json({ error: "Платёж не найден" }); return; }
  if (payment.status !== "succeeded") { res.status(400).json({ error: "Можно вернуть только успешный платёж" }); return; }

  const refundAmount = (req.body as { amount?: number }).amount ?? payment.amount;
  if (refundAmount > payment.amount) {
    res.status(400).json({ error: "Сумма возврата больше суммы платежа" });
    return;
  }

  const provider = getPaymentProvider();
  await provider.refund({
    externalId: payment.externalId!,
    amount: refundAmount,
    reason: (req.body as { reason?: string }).reason,
  });

  const updated = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      refundedAt: new Date(),
      refundedAmount: refundAmount,
      status: refundAmount >= payment.amount ? "canceled" : payment.status,
    },
  });

  // Обновляем бронь
  const newPaidAmount = Math.max(0, payment.booking.paidAmount - refundAmount);
  await prisma.booking.update({
    where: { id: payment.bookingId },
    data: {
      paidAmount: newPaidAmount,
      paymentStatus: newPaidAmount === 0 ? "refunded" : "deposit_paid",
    },
  });

  res.json(updated);
}));

export default router;
