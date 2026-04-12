"use client";

import {
  useState,
  useRef,
  useEffect,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  CalendarDays,
  Clock,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
} from "lucide-react";

const MAX_GUESTS = 16;

type Branch = "any" | "complex-9" | "complex-50";

const BRANCH_OPTIONS: { value: Branch; label: string }[] = [
  { value: "any", label: "Любой филиал" },
  { value: "complex-9", label: "Сауна 9 комплекс" },
  { value: "complex-50", label: "Сауна 50 комплекс" },
];

const MONTHS = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];
const MONTHS_LOWER = MONTHS.map((m) => m.toLowerCase());

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function getDefaultStartHour() {
  const now = new Date();
  return Math.min(22, now.getHours() + 1);
}

export function HeroQuickBooking() {
  const router = useRouter();

  const [branch, setBranch] = useState<Branch>("any");
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [startHour, setStartHour] = useState<number>(getDefaultStartHour);
  const [endHour, setEndHour] = useState<number>(() => Math.min(23, getDefaultStartHour() + 2));
  const [guests, setGuests] = useState(2);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const guestsRef = useRef<HTMLDivElement>(null);

  // Date + time picker state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerStep, setPickerStep] = useState<"date" | "time">("date");
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());

  const pickerRef = useRef<HTMLDivElement>(null);

  // Branch dropdown state
  const [branchOpen, setBranchOpen] = useState(false);
  const branchRef = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    if (!pickerOpen && !branchOpen && !guestsOpen) return;
    function onMouseDown(e: MouseEvent) {
      const target = e.target as Node;
      if (pickerOpen && pickerRef.current && !pickerRef.current.contains(target)) {
        setPickerOpen(false);
      }
      if (branchOpen && branchRef.current && !branchRef.current.contains(target)) {
        setBranchOpen(false);
      }
      if (guestsOpen && guestsRef.current && !guestsRef.current.contains(target)) {
        setGuestsOpen(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [pickerOpen, branchOpen, guestsOpen]);

  const branchLabel =
    BRANCH_OPTIONS.find((o) => o.value === branch)?.label ?? "Любой филиал";

  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const isPast = (day: number) =>
    new Date(viewYear, viewMonth, day) < todayStart;

  const isToday = (day: number) =>
    day === today.getDate() &&
    viewMonth === today.getMonth() &&
    viewYear === today.getFullYear();

  const isSelected = (day: number) =>
    day === selectedDate.getDate() &&
    viewMonth === selectedDate.getMonth() &&
    viewYear === selectedDate.getFullYear();

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleDateClick = (day: number) => {
    setSelectedDate(new Date(viewYear, viewMonth, day));
    setPickerStep("time");
  };

  const handleSlotClick = (hour: number) => {
    // Повторный клик на стартовый час с одночасовой бронью — ничего
    if (hour === startHour && endHour === startHour + 1) {
      return;
    }
    // Клик раньше или равно старту — новый старт, 1 час
    if (hour <= startHour) {
      setStartHour(hour);
      setEndHour(hour + 1);
      return;
    }
    // Клик позже старта — расширяем диапазон
    setEndHour(hour + 1);
  };

  const openPicker = () => {
    setPickerStep("date");
    setViewYear(selectedDate.getFullYear());
    setViewMonth(selectedDate.getMonth());
    setPickerOpen(true);
  };

  const toggleBranchOpen = () => {
    setBranchOpen((p) => !p);
  };

  const hoursCount = endHour - startHour;
  const dateTimeDisplay = `${selectedDate.getDate()} ${
    MONTHS_LOWER[selectedDate.getMonth()]
  } ${selectedDate.getFullYear()}, ${pad(startHour)}:00 — ${pad(endHour)}:00`;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const dateStr = `${selectedDate.getFullYear()}-${pad(
      selectedDate.getMonth() + 1,
    )}-${pad(selectedDate.getDate())}`;
    const params = new URLSearchParams({
      date: dateStr,
      time: `${pad(startHour)}:00`,
      endTime: `${pad(endHour)}:00`,
      guests: String(guests),
    });
    if (branch === "any") {
      // Любой филиал → общий поиск со всеми саунами обоих филиалов
      router.push(`/search?${params.toString()}`);
    } else {
      router.push(`/${branch}?${params.toString()}`);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.46, ease: "easeOut" }}
      style={{ willChange: "transform, opacity" }}
      className="w-full rounded-2xl border border-white/20 bg-white/10 p-4 shadow-2xl backdrop-blur-xl md:p-5"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1.2fr_1.5fr_0.9fr_auto]">
        {/* Branch — custom dropdown matching the calendar popup */}
        <div ref={branchRef} className="relative">
          <button
            type="button"
            onClick={toggleBranchOpen}
            className="flex w-full items-center justify-between gap-2 rounded-xl bg-black/30 px-3 py-2 text-left ring-1 ring-white/15 transition hover:ring-white/30 focus:outline-none focus:ring-white/40"
          >
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-white/60">
                <MapPin className="h-3 w-3" />
                Филиал
              </span>
              <span className="truncate text-sm font-semibold text-white">
                {branchLabel}
              </span>
            </span>
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-white/60 transition-transform ${
                branchOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          <AnimatePresence>
            {branchOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-border bg-card p-2 shadow-xl"
              >
                {BRANCH_OPTIONS.map((opt) => {
                  const active = opt.value === branch;
                  return (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => {
                        setBranch(opt.value);
                        setBranchOpen(false);
                      }}
                      className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                        active
                          ? "bg-forest text-white"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <span className="truncate">{opt.label}</span>
                      {active && <Check className="h-4 w-4 shrink-0" />}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Date + Time merged trigger */}
        <div ref={pickerRef} className="relative">
          <button
            type="button"
            onClick={() => (pickerOpen ? setPickerOpen(false) : openPicker())}
            className="flex w-full flex-col gap-0.5 rounded-xl bg-black/30 px-3 py-2 text-left ring-1 ring-white/15 transition hover:ring-white/30 focus:outline-none focus:ring-white/40"
          >
            <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-white/60">
              <CalendarDays className="h-3 w-3" />
              Дата и время
            </span>
            <span className="truncate text-sm font-semibold text-white">
              {dateTimeDisplay}
            </span>
          </button>

          <AnimatePresence>
            {pickerOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-border bg-card p-4 shadow-xl"
              >
                {pickerStep === "date" ? (
                  <>
                    {/* Month nav */}
                    <div className="mb-4 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={prevMonth}
                        className="rounded-lg p-1.5 transition-colors hover:bg-muted"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <span className="text-sm font-semibold">
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

                    {/* Weekday headers */}
                    <div className="mb-2 grid grid-cols-7 gap-1">
                      {WEEKDAYS.map((day) => (
                        <div
                          key={day}
                          className="py-1 text-center text-xs font-medium text-muted-foreground"
                        >
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Days grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {Array.from({ length: firstDay }).map((_, i) => (
                        <div key={`empty-${i}`} />
                      ))}
                      {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(
                        (day) => (
                          <button
                            type="button"
                            key={day}
                            disabled={isPast(day)}
                            onClick={() => handleDateClick(day)}
                            className={`h-9 w-full rounded-lg text-sm font-medium transition-colors ${
                              isSelected(day)
                                ? "bg-forest text-white"
                                : isToday(day)
                                  ? "bg-forest/20 text-forest"
                                  : isPast(day)
                                    ? "cursor-not-allowed text-muted-foreground/30"
                                    : "text-foreground hover:bg-muted"
                            }`}
                          >
                            {day}
                          </button>
                        ),
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPickerStep("date")}
                        className="rounded-lg p-1.5 transition-colors hover:bg-muted"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <Clock className="h-4 w-4 text-forest" />
                      <span className="text-sm font-semibold">
                        Выберите время
                      </span>
                    </div>

                    <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Один клик — 1 час, второй — расширить диапазон
                    </div>

                    <div className="grid grid-cols-6 gap-1.5">
                      {HOURS.map((hour) => {
                        const inRange = hour >= startHour && hour < endHour;
                        return (
                          <button
                            type="button"
                            key={hour}
                            onClick={() => handleSlotClick(hour)}
                            className={`rounded py-1.5 text-xs font-medium transition-colors ${
                              inRange
                                ? "bg-forest text-white"
                                : "bg-muted hover:bg-forest/20 text-foreground"
                            }`}
                          >
                            {pad(hour)}
                          </button>
                        );
                      })}
                    </div>

                    {hoursCount > 0 && (
                      <div className="mt-3 text-center text-xs text-muted-foreground">
                        {pad(startHour)}:00 — {pad(endHour)}:00 ({hoursCount}{" "}
                        {hoursCount === 1 ? "час" : hoursCount < 5 ? "часа" : "часов"})
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Guests — кастомный дропдаун */}
        <div ref={guestsRef} className="relative">
          <button
            type="button"
            onClick={() => setGuestsOpen((p) => !p)}
            className="flex w-full items-center justify-between gap-2 rounded-xl bg-black/30 px-3 py-2 text-left ring-1 ring-white/15 transition hover:ring-white/30 focus:outline-none focus:ring-white/40"
          >
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-white/60">
                <Users className="h-3 w-3" />
                Гостей
              </span>
              <span className="truncate text-sm font-semibold text-white">
                {guests}{" "}
                {guests === 1 ? "гость" : guests < 5 ? "гостя" : "гостей"}
              </span>
            </span>
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-white/60 transition-transform ${
                guestsOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          <AnimatePresence>
            {guestsOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="absolute left-0 right-0 top-full z-50 mt-2 max-h-64 overflow-y-auto rounded-xl border border-border bg-card p-2 shadow-xl"
                style={{ willChange: "transform, opacity" }}
              >
                {Array.from({ length: MAX_GUESTS }, (_, i) => i + 1).map((n) => {
                  const active = n === guests;
                  return (
                    <button
                      type="button"
                      key={n}
                      onClick={() => {
                        setGuests(n);
                        setGuestsOpen(false);
                      }}
                      className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                        active
                          ? "bg-forest text-white"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <span>
                        {n} {n === 1 ? "гость" : n < 5 ? "гостя" : "гостей"}
                      </span>
                      {active && <Check className="h-4 w-4 shrink-0" />}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-700 via-emerald-800 to-emerald-900 px-6 py-3 text-sm font-semibold text-white shadow-lg ring-1 ring-emerald-500/40 transition-[transform,filter,box-shadow] duration-200 hover:-translate-y-0.5 hover:brightness-110"
        >
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          <Search className="h-4 w-4" />
          Найти сауну
        </button>
      </div>
    </motion.form>
  );
}
