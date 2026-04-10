import prisma from "../prismaClient";

export interface BookingTimeRange {
  startAt: Date;
  endAt: Date;
}

/**
 * Проверяет, конфликтует ли новая бронь с существующими.
 *
 * Каждая бронь занимает интервал [startAt, endAt + cleaningMinutes].
 * Две брони конфликтуют, если их занятые интервалы пересекаются.
 *
 * @returns true если есть конфликт, false если время свободно
 */
export async function hasBookingConflict(
  saunaId: number,
  startAt: Date,
  endAt: Date,
  cleaningMinutes: number,
  excludeBookingId?: number,
): Promise<boolean> {
  const cleaningMs = cleaningMinutes * 60_000;
  const newOccupiedEnd = new Date(endAt.getTime() + cleaningMs);

  // Ищем брони, которые могут пересечься.
  // Два интервала [a1,a2] и [b1,b2] пересекаются, если a1 < b2 AND a2 > b1.
  // Для нас: existing.startAt < newOccupiedEnd AND (existing.endAt + cleaning) > newStartAt
  const candidates = await prisma.booking.findMany({
    where: {
      saunaId,
      status: { not: "cancelled" },
      ...(excludeBookingId && { id: { not: excludeBookingId } }),
      startAt: { lt: newOccupiedEnd },
    },
    select: { id: true, startAt: true, endAt: true },
  });

  for (const b of candidates) {
    const existingOccupiedEnd = new Date(b.endAt.getTime() + cleaningMs);
    if (existingOccupiedEnd > startAt) {
      return true;
    }
  }
  return false;
}

/**
 * Возвращает занятые интервалы сауны на конкретный день (UTC).
 * Формат удобен для рендеринга таймлайна на фронте.
 */
export async function getSaunaAvailability(saunaId: number, dateISO: string) {
  const sauna = await prisma.sauna.findUnique({ where: { id: saunaId } });
  if (!sauna) return null;

  const dayStart = new Date(dateISO);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const cleaningMs = sauna.cleaningMinutes * 60_000;

  // Берём брони, которые могут затрагивать этот день
  // (включая брони предыдущего дня, чьи cleaningEnd попадают в этот день)
  const lookback = new Date(dayStart.getTime() - 24 * 60 * 60_000);
  const bookings = await prisma.booking.findMany({
    where: {
      saunaId,
      status: { not: "cancelled" },
      startAt: { gte: lookback, lt: dayEnd },
    },
    orderBy: { startAt: "asc" },
    select: { id: true, startAt: true, endAt: true },
  });

  const occupied = bookings
    .map((b: { id: number; startAt: Date; endAt: Date }) => ({
      bookingId: b.id,
      start: b.startAt.toISOString(),
      end: b.endAt.toISOString(),
      cleaningEnd: new Date(b.endAt.getTime() + cleaningMs).toISOString(),
    }))
    .filter((b) => new Date(b.cleaningEnd) > dayStart);

  return {
    date: dayStart.toISOString().slice(0, 10),
    saunaId: sauna.id,
    openHour: sauna.openHour,
    closeHour: sauna.closeHour,
    minHours: sauna.minHours,
    cleaningMinutes: sauna.cleaningMinutes,
    occupied,
  };
}
