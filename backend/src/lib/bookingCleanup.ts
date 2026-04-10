import cron from "node-cron";
import logger from "./logger";
import { broadcast } from "./sse";
import prisma from "../prismaClient";

const PAYMENT_TTL_MINUTES = 15;

/**
 * Каждую минуту чистим брони, по которым не пришла оплата за 15 минут.
 * Слот освобождается, бронь переходит в "cancelled".
 */
export function initBookingCleanup() {
  cron.schedule("* * * * *", async () => {
    const cutoff = new Date(Date.now() - PAYMENT_TTL_MINUTES * 60_000);

    const stale = await prisma.booking.findMany({
      where: {
        status: "pending_payment",
        createdAt: { lt: cutoff },
      },
      select: { id: true, payments: { select: { id: true, externalId: true, status: true } } },
    });

    if (stale.length === 0) return;

    for (const b of stale) {
      await prisma.booking.update({
        where: { id: b.id },
        data: { status: "cancelled", paymentStatus: "pending" },
      });

      // Отменяем все pending платежи этой брони
      for (const p of b.payments) {
        if (p.status === "pending") {
          await prisma.payment.update({
            where: { id: p.id },
            data: { status: "canceled" },
          });
        }
      }

      broadcast("booking_deleted", { id: b.id });
    }

    logger.info({ count: stale.length }, "Cancelled stale unpaid bookings");
  });

  logger.info("Booking cleanup cron started (every minute, TTL 15 min)");
}
