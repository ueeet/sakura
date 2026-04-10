/**
 * Все даты в API трактуются как Московское время (UTC+3, без перехода на летнее).
 *
 * Контракт:
 * - Входящие даты без TZ → парсятся как Москва
 * - Входящие даты с TZ (Z или +03:00) → парсятся с учётом TZ
 * - Все Date в JSON-ответах автоматически сериализуются как ISO с +03:00
 * - В БД хранятся как UTC (timestamptz), но это деталь имплементации
 */

const MOSCOW_TZ = "Europe/Moscow";
const MOSCOW_OFFSET = "+03:00";

const HAS_TZ = /([+-]\d{2}:?\d{2}|Z)$/;
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Парсит строку даты как Московское время, если в ней нет указания TZ.
 *
 * Примеры:
 *   parseMoscowDate("2026-04-15T11:00:00")        → 2026-04-15 11:00 MSK
 *   parseMoscowDate("2026-04-15T11:00:00+03:00")  → 2026-04-15 11:00 MSK
 *   parseMoscowDate("2026-04-15T08:00:00Z")       → 2026-04-15 11:00 MSK (UTC→MSK)
 *   parseMoscowDate("2026-04-15")                 → 2026-04-15 00:00 MSK
 */
export function parseMoscowDate(input: string): Date {
  if (HAS_TZ.test(input)) {
    return new Date(input);
  }
  if (DATE_ONLY.test(input)) {
    return new Date(`${input}T00:00:00${MOSCOW_OFFSET}`);
  }
  return new Date(`${input}${MOSCOW_OFFSET}`);
}

/**
 * Сериализует Date в ISO-строку с явным московским смещением:
 *   "2026-04-15T11:00:00.000+03:00"
 *
 * Это формат, который видит фронт в API-ответах.
 */
export function formatMoscowISO(date: Date): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: MOSCOW_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  // hour может быть "24" в Intl для полуночи — нормализуем в "00"
  const hour = get("hour") === "24" ? "00" : get("hour");
  const ms = String(date.getMilliseconds()).padStart(3, "0");
  return `${get("year")}-${get("month")}-${get("day")}T${hour}:${get("minute")}:${get("second")}.${ms}${MOSCOW_OFFSET}`;
}

/**
 * Форматирует Date для человекочитаемого отображения в Telegram/SMS:
 *   "15.04.2026, 11:00"
 */
export function formatMoscowHuman(date: Date): string {
  return new Intl.DateTimeFormat("ru-RU", {
    timeZone: MOSCOW_TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Возвращает только дату в формате "15.04.2026" в Москве.
 */
export function formatMoscowDateOnly(date: Date): string {
  return new Intl.DateTimeFormat("ru-RU", {
    timeZone: MOSCOW_TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

/**
 * Возвращает только время в формате "11:00" в Москве.
 */
export function formatMoscowTimeOnly(date: Date): string {
  return new Intl.DateTimeFormat("ru-RU", {
    timeZone: MOSCOW_TZ,
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
