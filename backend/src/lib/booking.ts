import prisma from "../prismaClient";
import { parseMoscowDate } from "./timezone";

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

interface SlotInfo {
  hour: number;
  available: boolean;
  reason?: "booked" | "cleaning" | "closed";
}

/**
 * Возвращает занятые интервалы и почасовые слоты для дня.
 * Формат удобен для рендеринга таймлайна на фронте.
 */
export async function getSaunaAvailability(saunaId: number, dateISO: string) {
  const sauna = await prisma.sauna.findUnique({ where: { id: saunaId } });
  if (!sauna) return null;

  // Полночь Москвы для запрошенного дня (process.env.TZ=Europe/Moscow обеспечивает локаль)
  const dayStart = parseMoscowDate(dateISO);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const cleaningMs = sauna.cleaningMinutes * 60_000;

  // Берём брони, чьи [start, end+cleaning] могут затрагивать этот день
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
    .map((b: { id: number; startAt: Date; endAt: Date }) => {
      const cleaningEnd = new Date(b.endAt.getTime() + cleaningMs);
      return {
        bookingId: b.id,
        start: b.startAt.toISOString(),
        end: b.endAt.toISOString(),
        cleaningEnd: cleaningEnd.toISOString(),
        _startMs: b.startAt.getTime(),
        _endMs: b.endAt.getTime(),
        _cleanEndMs: cleaningEnd.getTime(),
      };
    })
    .filter((b) => b._cleanEndMs > dayStart.getTime());

  // Почасовые слоты для выбранного дня
  const slots: SlotInfo[] = [];
  const openHour = sauna.openHour;
  const closeHour = sauna.closeHour === 24 ? 24 : sauna.closeHour;

  for (let h = 0; h < 24; h++) {
    const slotStart = new Date(dayStart);
    slotStart.setHours(h, 0, 0, 0);
    const slotEnd = new Date(slotStart);
    slotEnd.setHours(h + 1);
    const slotStartMs = slotStart.getTime();
    const slotEndMs = slotEnd.getTime();

    // Закрыто — вне рабочих часов
    if (h < openHour || h >= closeHour) {
      slots.push({ hour: h, available: false, reason: "closed" });
      continue;
    }

    // Занято бронью или уборкой
    let booked = false;
    let cleaning = false;
    for (const b of occupied) {
      // Бронь покрывает слот?
      if (b._startMs < slotEndMs && b._endMs > slotStartMs) {
        booked = true;
        break;
      }
      // Уборка покрывает слот?
      if (b._endMs <= slotStartMs && b._cleanEndMs > slotStartMs) {
        cleaning = true;
        break;
      }
    }

    if (booked) slots.push({ hour: h, available: false, reason: "booked" });
    else if (cleaning) slots.push({ hour: h, available: false, reason: "cleaning" });
    else slots.push({ hour: h, available: true });
  }

  return {
    date: dayStart.toISOString().slice(0, 10),
    saunaId: sauna.id,
    openHour: sauna.openHour,
    closeHour: sauna.closeHour,
    minHours: sauna.minHours,
    cleaningMinutes: sauna.cleaningMinutes,
    occupied: occupied.map(({ _startMs, _endMs, _cleanEndMs, ...rest }) => rest),
    slots,
  };
}
