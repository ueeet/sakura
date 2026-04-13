"use client";

import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

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
  // Воскресенье в JS = 0, нам нужно понедельник = 0
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function parseISO(date: string | null): Date | null {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toISO(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

interface Props {
  value: string | null;       // "YYYY-MM-DD" | null
  onChange: (v: string | null) => void;
  placeholder?: string;
}

/**
 * Кнопка-таблетка с поповер-календарём в стилистике сайта.
 * Используется в фильтрах /search вместо нативного <input type="date">,
 * который в Chromium даёт некрасивый светлый picker.
 *
 * Логика выбора месяца/дней — копия HeroQuickBooking, но date-only
 * (без таймпикера, его делают отдельные select'ы рядом).
 */
export function DatePopover({ value, onChange, placeholder = "Дата" }: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selected = parseISO(value);

  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() =>
    (selected ?? today).getFullYear(),
  );
  const [viewMonth, setViewMonth] = useState(() =>
    (selected ?? today).getMonth(),
  );

  const buttonRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  // Координаты попапа в viewport — обновляем на scroll/resize.
  // Попап рендерится через portal в body, чтобы не обрезался
  // overflow:auto модалок/скроллящихся родителей.
  useEffect(() => {
    if (!open) return;
    const update = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      setCoords({ top: rect.bottom + 8, left: rect.left });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open]);

  // Закрытие по клику вне кнопки И вне попапа
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (buttonRef.current?.contains(t)) return;
      if (popupRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const isPast = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    return d.getTime() < today.getTime();
  };
  const isToday = (day: number) =>
    today.getFullYear() === viewYear &&
    today.getMonth() === viewMonth &&
    today.getDate() === day;
  const isSelected = (day: number) =>
    selected !== null &&
    selected.getFullYear() === viewYear &&
    selected.getMonth() === viewMonth &&
    selected.getDate() === day;

  const display = selected
    ? `${selected.getDate()} ${MONTHS_LOWER[selected.getMonth()]} ${selected.getFullYear()}`
    : placeholder;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm font-medium transition-colors hover:bg-muted/80 focus:outline-none focus:ring-1 focus:ring-forest ${
          selected ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        <CalendarDays className="h-4 w-4 text-muted-foreground" />
        <span>{display}</span>
      </button>

      {typeof window !== "undefined" && createPortal(
      <AnimatePresence>
        {open && coords && (
          <motion.div
            ref={popupRef}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            style={{
              willChange: "transform, opacity",
              top: coords.top,
              left: Math.min(coords.left, typeof window !== "undefined" ? window.innerWidth - 336 : coords.left),
            }}
            className="fixed z-[200] w-[320px] rounded-xl border border-border bg-card p-4 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <button
                type="button"
                onClick={prevMonth}
                className="rounded-lg p-1.5 transition-colors hover:bg-muted"
                aria-label="Предыдущий месяц"
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
                aria-label="Следующий месяц"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-2 grid grid-cols-7 gap-1">
              {WEEKDAYS.map((d) => (
                <div
                  key={d}
                  className="py-1 text-center text-xs font-medium text-muted-foreground"
                >
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
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
                    onClick={() => {
                      onChange(toISO(new Date(viewYear, viewMonth, day)));
                      setOpen(false);
                    }}
                    className={`h-9 w-full rounded-lg text-sm font-medium transition-colors ${
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

            {selected && (
              <button
                type="button"
                onClick={() => {
                  onChange(null);
                  setOpen(false);
                }}
                className="mt-3 w-full rounded-lg py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                Очистить дату
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
