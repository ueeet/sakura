"use client";

import {
  useState,
  useRef,
  useEffect,
  type FormEvent,
  type ReactNode,
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

const TIME_SLOTS = [
  "09:00", "10:00", "11:00", "12:00", "13:00", "14:00",
  "15:00", "16:00", "17:00", "18:00", "19:00", "20:00",
  "21:00", "22:00", "23:00",
];

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

function getDefaultTime() {
  const now = new Date();
  const next = now.getHours() + 1;
  if (next < 9) return "09:00";
  if (next > 22) return "22:00";
  return `${pad(next)}:00`;
}

/**
 * Решает, в какую сторону открывать попап от триггера: вниз по умолчанию,
 * вверх если снизу не хватает места на `popupHeight` пикселей. Учитывает 16px
 * запаса от края viewport. Безопасно вызывать с null контейнером.
 */
function computeDirection(
  container: HTMLElement | null,
  popupHeight: number,
): "down" | "up" {
  if (typeof window === "undefined" || !container) return "down";
  const rect = container.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom - 16;
  const spaceAbove = rect.top - 16;
  if (spaceBelow >= popupHeight) return "down";
  if (spaceAbove > spaceBelow) return "up";
  return "down";
}

export function HeroQuickBooking() {
  const router = useRouter();

  const [branch, setBranch] = useState<Branch>("any");
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [selectedTime, setSelectedTime] = useState<string>(getDefaultTime);
  const [selectedEndTime, setSelectedEndTime] = useState<string>(() => {
    const start = getDefaultTime();
    const startH = parseInt(start.slice(0, 2), 10);
    const endH = Math.min(23, startH + 2);
    return `${pad(endH)}:00`;
  });
  const [guests, setGuests] = useState(2);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const guestsRef = useRef<HTMLDivElement>(null);

  // Date + time picker state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerStep, setPickerStep] = useState<"date" | "time">("date");
  const [timeSubStep, setTimeSubStep] = useState<"start" | "end">("start");
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
  // Был ли конец явно выбран пользователем в текущей сессии пикера.
  // Сбрасывается в false при каждом клике по старту, ставится в true только
  // при клике по кнопке конца. Управляет подсветкой в гриде «Время окончания»,
  // чтобы НЕ показывать предыдущий выбор как активный.
  const [endTimeFreshlyChosen, setEndTimeFreshlyChosen] = useState(false);
  // Направление, в котором открывать попап календаря: вниз по умолчанию,
  // вверх если снизу не хватает места (низкие лептопы / горизонтальный таблет).
  const [pickerDirection, setPickerDirection] = useState<"down" | "up">("down");

  const pickerRef = useRef<HTMLDivElement>(null);

  // Branch dropdown state
  const [branchOpen, setBranchOpen] = useState(false);
  const [branchDirection, setBranchDirection] = useState<"down" | "up">("down");
  const branchRef = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    if (!pickerOpen && !branchOpen) return;
    function onMouseDown(e: MouseEvent) {
      const target = e.target as Node;
      if (pickerOpen && pickerRef.current && !pickerRef.current.contains(target)) {
        setPickerOpen(false);
      }
      if (branchOpen && branchRef.current && !branchRef.current.contains(target)) {
        setBranchOpen(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [pickerOpen, branchOpen]);

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
    setTimeSubStep("start");
  };

  const handleStartTimeClick = (time: string) => {
    setSelectedTime(time);
    // Всегда задаём дефолтный конец = старт + 2ч (с потолком 23:00) — чтобы
    // форма содержала валидный диапазон, даже если юзер закроет пикер кликом
    // вне (не выбрав явно конец). Грид при этом ничего не подсвечивает —
    // см. endTimeFreshlyChosen ниже.
    const startH = parseInt(time.slice(0, 2), 10);
    const newEnd = Math.min(23, startH + 2);
    setSelectedEndTime(`${pad(newEnd)}:00`);
    setEndTimeFreshlyChosen(false);
    setTimeSubStep("end");
  };

  const handleEndTimeClick = (time: string) => {
    setSelectedEndTime(time);
    setEndTimeFreshlyChosen(true);
    // Пикер НЕ закрываем автоматически — пользователь закрывает сам
    // (клик вне или повторный клик по триггеру). Это даёт возможность
    // спокойно перевыбрать конец, не открывая пикер заново.
  };

  const openPicker = () => {
    setPickerStep("date");
    setTimeSubStep("start");
    setViewYear(selectedDate.getFullYear());
    setViewMonth(selectedDate.getMonth());
    setPickerDirection(computeDirection(pickerRef.current, 440));
    setPickerOpen(true);
  };

  const toggleBranchOpen = () => {
    if (branchOpen) {
      setBranchOpen(false);
      return;
    }
    // Высота попапа филиала ≈ 3 пункта × ~46px + padding ≈ 160px
    setBranchDirection(computeDirection(branchRef.current, 180));
    setBranchOpen(true);
  };

  const dateTimeDisplay = `${selectedDate.getDate()} ${
    MONTHS_LOWER[selectedDate.getMonth()]
  } ${selectedDate.getFullYear()}, ${selectedTime} — ${selectedEndTime}`;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const dateStr = `${selectedDate.getFullYear()}-${pad(
      selectedDate.getMonth() + 1,
    )}-${pad(selectedDate.getDate())}`;
    const params = new URLSearchParams({
      date: dateStr,
      time: selectedTime,
      endTime: selectedEndTime,
      guests: String(guests),
    });
    if (branch === "any") {
      // TODO: когда появится /search или общий листинг — направлять туда
      params.set("branch", "any");
      router.push(`/complex-9?${params.toString()}`);
    } else {
      router.push(`/${branch}?${params.toString()}`);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.64, ease: "easeOut" }}
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
            <span className="flex min-w-0 flex-col gap-1">
              <span className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-white/60">
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
                initial={{
                  opacity: 0,
                  y: branchDirection === "down" ? -8 : 8,
                  scale: 0.96,
                }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{
                  opacity: 0,
                  y: branchDirection === "down" ? -8 : 8,
                  scale: 0.96,
                }}
                transition={{ duration: 0.2 }}
                className={`absolute left-0 right-0 z-50 rounded-xl border border-border bg-card p-2 shadow-xl ${
                  branchDirection === "down"
                    ? "top-full mt-2"
                    : "bottom-full mb-2"
                }`}
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
            className="flex w-full flex-col gap-1 rounded-xl bg-black/30 px-3 py-2 text-left ring-1 ring-white/15 transition hover:ring-white/30 focus:outline-none focus:ring-white/40"
          >
            <span className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-white/60">
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
                initial={{
                  opacity: 0,
                  y: pickerDirection === "down" ? -8 : 8,
                  scale: 0.96,
                }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{
                  opacity: 0,
                  y: pickerDirection === "down" ? -8 : 8,
                  scale: 0.96,
                }}
                transition={{ duration: 0.2 }}
                className={`absolute left-0 right-0 z-50 rounded-xl border border-border bg-card p-4 shadow-xl ${
                  pickerDirection === "down"
                    ? "top-full mt-2"
                    : "bottom-full mb-2"
                }`}
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
                    <div className="mb-4 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (timeSubStep === "end") {
                            setTimeSubStep("start");
                          } else {
                            setPickerStep("date");
                          }
                        }}
                        className="rounded-lg p-1.5 transition-colors hover:bg-muted"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <Clock className="h-4 w-4 text-forest" />
                      <span className="text-sm font-semibold">
                        {timeSubStep === "start"
                          ? "Время начала"
                          : "Время окончания"}
                      </span>
                      {timeSubStep === "end" && (
                        <span className="ml-auto text-xs text-muted-foreground">
                          с {selectedTime}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {TIME_SLOTS.map((time) => {
                        const slotH = parseInt(time.slice(0, 2), 10);
                        const startH = parseInt(selectedTime.slice(0, 2), 10);
                        const isEnd = timeSubStep === "end";
                        const isDisabled = isEnd && slotH <= startH;
                        const isActive = isEnd
                          ? endTimeFreshlyChosen && selectedEndTime === time
                          : selectedTime === time;
                        const inRange =
                          isEnd &&
                          endTimeFreshlyChosen &&
                          !isDisabled &&
                          slotH > startH &&
                          slotH <
                            parseInt(selectedEndTime.slice(0, 2), 10);

                        return (
                          <button
                            type="button"
                            key={time}
                            disabled={isDisabled}
                            onClick={() =>
                              isEnd
                                ? handleEndTimeClick(time)
                                : handleStartTimeClick(time)
                            }
                            className={`rounded-lg py-2.5 text-sm font-medium transition-colors ${
                              isActive
                                ? "bg-forest text-white"
                                : isDisabled
                                  ? "cursor-not-allowed bg-muted/40 text-muted-foreground/40"
                                  : inRange
                                    ? "bg-forest/20 text-forest"
                                    : "bg-muted text-foreground hover:bg-forest/20 hover:text-forest"
                            }`}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Guests */}
        <Field icon={<Users className="h-3 w-3" />} label="Гостей">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={guestsInput}
            onChange={(e) => {
              const v = e.target.value;
              // Разрешаем пустое поле и любые цифры — нормализация на blur.
              // Клампинг 1..30 живёт в derived `guests` и применяется в onBlur.
              if (v === "" || /^\d+$/.test(v)) setGuestsInput(v);
            }}
            onBlur={() => setGuestsInput(String(guests))}
            className="w-full bg-transparent text-sm font-semibold text-white outline-none"
          />
        </Field>

        {/* Submit */}
        <button
          type="submit"
          className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-700 via-emerald-800 to-emerald-900 px-6 py-3 text-sm font-semibold text-white shadow-lg ring-1 ring-emerald-500/40 transition-all hover:-translate-y-0.5 hover:brightness-110"
        >
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          <Search className="h-4 w-4" />
          Подобрать
        </button>
      </div>
    </motion.form>
  );
}

function Field({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 rounded-xl bg-black/30 px-3 py-2 text-left ring-1 ring-white/15 transition focus-within:ring-white/40">
      <span className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-white/60">
        {icon}
        {label}
      </span>
      {children}
    </label>
  );
}
