"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { useClickOutside } from "@/components/ui/use-click-outside";

const MONTHS = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];
const MONTHS_LOWER = MONTHS.map((m) => m.toLowerCase());
const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

interface Props {
  /** Значение в формате "YYYY-MM-DDTHH:MM" (МСК, без TZ) */
  value: string;
  onChange: (v: string) => void;
  /** Разрешить прошлые даты (в админке актуально) */
  allowPast?: boolean;
}

/**
 * Компактный date+time пикер для админки в стилистике сайта.
 * Показывает кнопку «дата · время», по клику — попап с календарём
 * и списком часов/минут. Без нативных datetime-local — Chromium
 * рендерит их светлыми, на тёмной админке выглядит инородно.
 */
export function DateTimePicker({ value, onChange, allowPast = true }: Props) {
  const [date, hhmm] = value ? value.split("T") : ["", "00:00"];
  const [hh = "00"] = (hhmm || "00:00").split(":");
  const mm = "00"; // минуты всегда :00 — брони на час

  const parsed = parseLocal(date);
  const [viewYear, setViewYear] = useState(() => (parsed ?? new Date()).getFullYear());
  const [viewMonth, setViewMonth] = useState(() => (parsed ?? new Date()).getMonth());

  useEffect(() => {
    if (parsed) {
      setViewYear(parsed.getFullYear());
      setViewMonth(parsed.getMonth());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const isPast = (day: number) => {
    if (allowPast) return false;
    const d = new Date(viewYear, viewMonth, day);
    return d.getTime() < today.getTime();
  };
  const isToday = (day: number) =>
    today.getFullYear() === viewYear &&
    today.getMonth() === viewMonth &&
    today.getDate() === day;
  const isSelected = (day: number) =>
    parsed !== null &&
    parsed.getFullYear() === viewYear &&
    parsed.getMonth() === viewMonth &&
    parsed.getDate() === day;

  const pickDay = (day: number) => {
    const iso = `${viewYear}-${pad(viewMonth + 1)}-${pad(day)}`;
    onChange(`${iso}T${hh}:${mm}`);
  };

  const pickHour = (h: number) => {
    if (!date) return;
    onChange(`${date}T${pad(h)}:00`);
  };

  const display = parsed
    ? `${parsed.getDate()} ${MONTHS_LOWER[parsed.getMonth()]} · ${hh}:${mm}`
    : "Выберите время";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground transition-colors hover:border-forest/50 focus:outline-none focus:border-forest"
      >
        <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className={parsed ? "text-foreground" : "text-muted-foreground"}>
          {display}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.16 }}
            style={{ willChange: "transform, opacity" }}
            className="absolute left-0 top-full z-50 mt-2 flex w-[520px] max-w-[calc(100vw-32px)] flex-col rounded-xl border border-border bg-card p-3 shadow-xl sm:flex-row sm:gap-3"
          >
            {/* Calendar */}
            <div className="flex-1">
              <div className="mb-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="rounded-lg p-1.5 transition-colors hover:bg-muted"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm font-semibold text-foreground">
                  {MONTHS[viewMonth]} {viewYear}
                </span>
                <button
                  type="button"
                  onClick={nextMonth}
                  className="rounded-lg p-1.5 transition-colors hover:bg-muted"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="mb-1 grid grid-cols-7 gap-0.5">
                {WEEKDAYS.map((d) => (
                  <div key={d} className="py-1 text-center text-[10px] font-medium text-muted-foreground">
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-0.5">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                  const past = isPast(day);
                  const sel = isSelected(day);
                  const td = isToday(day);
                  return (
                    <button
                      type="button"
                      key={day}
                      disabled={past}
                      onClick={() => pickDay(day)}
                      className={`h-8 w-full rounded-md text-xs font-medium transition-colors ${
                        sel
                          ? "bg-forest text-white"
                          : td
                            ? "bg-forest/20 text-forest"
                            : past
                              ? "cursor-not-allowed text-muted-foreground/30"
                              : "text-foreground hover:bg-muted"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time — hours + minutes lists */}
            <div className="flex gap-2 border-t border-border pt-3 sm:w-[180px] sm:flex-col sm:border-l sm:border-t-0 sm:pl-3 sm:pt-0">
              <div className="flex-1">
                <div className="mb-1.5 flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Часы
                </div>
                <div className="h-[200px] overflow-y-auto rounded-md border border-border bg-background scrollbar-hide">
                  <div className="grid grid-cols-4 gap-0.5 p-1 sm:grid-cols-3">
                    {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => pickHour(h)}
                        className={`rounded px-1 py-1 text-xs font-medium transition-colors ${
                          Number(hh) === h
                            ? "bg-forest text-white"
                            : "text-foreground hover:bg-muted"
                        }`}
                      >
                        {pad(h)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Минуты
                </div>
                <div className="grid grid-cols-4 gap-0.5 rounded-md border border-border bg-background p-1 sm:grid-cols-3">
                  {[0, 15, 30, 45].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => pickMinute(m)}
                      className={`rounded px-1 py-1.5 text-xs font-medium transition-colors ${
                        Number(mm) === m
                          ? "bg-forest text-white"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      {pad(m)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function parseLocal(d: string): Date | null {
  if (!d || !/^\d{4}-\d{2}-\d{2}$/.test(d)) return null;
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day);
}
