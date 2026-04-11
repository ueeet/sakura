"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Clock,
  CalendarDays,
  Users,
  User,
  Phone,
  Loader2,
  AlertCircle,
  Check,
} from "lucide-react";
import type { Sauna, SaunaAvailability } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const MONTHS = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];
const MONTHS_GENITIVE = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];
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

function getDayType(date: Date): "weekday" | "weekend" {
  const d = date.getDay();
  return d === 0 || d === 6 ? "weekend" : "weekday";
}

function getTimeSlot(hour: number): "day" | "evening" | "night" {
  if (hour >= 9 && hour < 15) return "day";
  if (hour >= 15) return "evening";
  return "night";
}

/**
 * Нормализует российский номер телефона.
 * Принимает: +7XXXXXXXXXX, 7XXXXXXXXXX, 8XXXXXXXXXX, с пробелами/скобками/дефисами.
 * Возвращает либо +7XXXXXXXXXX (нормализованный), либо null если невалидный.
 */
function normalizeRussianPhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  // 11 цифр, начинается с 7 или 8 → конвертируем 8 в 7 и добавляем +
  if (digits.length === 11 && (digits[0] === "7" || digits[0] === "8")) {
    return "+7" + digits.slice(1);
  }
  // 10 цифр (без кода страны) → добавляем +7
  if (digits.length === 10) {
    return "+7" + digits;
  }
  return null;
}

/** Форматирует ввод телефона как +7 (XXX) XXX-XX-XX в процессе набора */
function formatPhoneInput(input: string): string {
  const digits = input.replace(/\D/g, "");
  // Убираем ведущие 7/8 — будем форматировать только 10 значащих цифр
  let body = digits;
  if (body.length > 0 && (body[0] === "7" || body[0] === "8")) {
    body = body.slice(1);
  }
  body = body.slice(0, 10);
  if (body.length === 0) return "";

  let result = "+7";
  if (body.length > 0) result += " (" + body.slice(0, 3);
  if (body.length >= 3) result += ")";
  if (body.length >= 4) result += " " + body.slice(3, 6);
  if (body.length >= 7) result += "-" + body.slice(6, 8);
  if (body.length >= 9) result += "-" + body.slice(8, 10);
  return result;
}

/** Текущее время в Москве: год / месяц (1-12) / день / час */
function getMoscowNow() {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Moscow",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "0";
  return {
    year: parseInt(get("year"), 10),
    month: parseInt(get("month"), 10),
    day: parseInt(get("day"), 10),
    hour: parseInt(get("hour"), 10),
  };
}

interface BookingPickerProps {
  sauna: Sauna;
  branchPhone?: string;
}

type Step = "select" | "form";

export function BookingPicker({ sauna }: BookingPickerProps) {
  const [step, setStep] = useState<Step>("select");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [startHour, setStartHour] = useState<number | null>(null);
  const [endHour, setEndHour] = useState<number | null>(null);
  const [guests, setGuests] = useState(2);

  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [paymentType, setPaymentType] = useState<"deposit" | "full">("deposit");
  const [agreeOferta, setAgreeOferta] = useState(false);
  const [agreePersonal, setAgreePersonal] = useState(false);

  const normalizedPhone = normalizeRussianPhone(phone);
  const phoneValid = normalizedPhone !== null;

  // Текущее московское время — пересчитываем при ре-рендере
  const moscowNow = useMemo(() => getMoscowNow(), []);
  const today = new Date();
  const [viewYear, setViewYear] = useState(moscowNow.year);
  const [viewMonth, setViewMonth] = useState(moscowNow.month - 1);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Является ли выбранная дата сегодняшним днём (в Москве)
  const isSelectedDateToday = useMemo(() => {
    if (!selectedDate) return false;
    return (
      selectedDate.getFullYear() === moscowNow.year &&
      selectedDate.getMonth() === moscowNow.month - 1 &&
      selectedDate.getDate() === moscowNow.day
    );
  }, [selectedDate, moscowNow]);

  // Час прошёл по МСК (для слотов)
  const isPastHour = (hour: number) =>
    isSelectedDateToday && hour <= moscowNow.hour;

  const [availability, setAvailability] = useState<SaunaAvailability | null>(null);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [guestsOpen, setGuestsOpen] = useState(false);
  const [guestsRect, setGuestsRect] = useState<{ left: number; top: number; width: number } | null>(null);
  const guestsButtonRef = useRef<HTMLButtonElement>(null);
  const guestsPanelRef = useRef<HTMLDivElement>(null);

  const [calendarRect, setCalendarRect] = useState<{ left: number; top: number; width: number } | null>(null);
  const calendarButtonRef = useRef<HTMLButtonElement>(null);
  const calendarPanelRef = useRef<HTMLDivElement>(null);

  const [slotsRect, setSlotsRect] = useState<{ left: number; top: number; width: number } | null>(null);
  const [slotsOpen, setSlotsOpen] = useState(false);
  const slotsButtonRef = useRef<HTMLButtonElement>(null);
  const slotsPanelRef = useRef<HTMLDivElement>(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Позиция и закрытие дропдауна гостей
  useEffect(() => {
    if (!guestsOpen) return;
    function updatePosition() {
      const btn = guestsButtonRef.current;
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      setGuestsRect({ left: r.left, top: r.bottom + 8, width: r.width });
    }
    updatePosition();
    function onMouseDown(e: MouseEvent) {
      const target = e.target as Node;
      if (
        guestsButtonRef.current?.contains(target) ||
        guestsPanelRef.current?.contains(target)
      ) {
        return;
      }
      setGuestsOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [guestsOpen]);

  // Позиция и закрытие календаря
  useEffect(() => {
    if (!calendarOpen) return;
    function updatePosition() {
      const btn = calendarButtonRef.current;
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      setCalendarRect({ left: r.left, top: r.bottom + 8, width: r.width });
    }
    updatePosition();
    function onMouseDown(e: MouseEvent) {
      const target = e.target as Node;
      if (
        calendarButtonRef.current?.contains(target) ||
        calendarPanelRef.current?.contains(target)
      ) {
        return;
      }
      setCalendarOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [calendarOpen]);

  // Позиция и закрытие выбора часов
  useEffect(() => {
    if (!slotsOpen) return;
    function updatePosition() {
      const btn = slotsButtonRef.current;
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      setSlotsRect({ left: r.left, top: r.bottom + 8, width: r.width });
    }
    updatePosition();
    function onMouseDown(e: MouseEvent) {
      const target = e.target as Node;
      if (
        slotsButtonRef.current?.contains(target) ||
        slotsPanelRef.current?.contains(target)
      ) {
        return;
      }
      setSlotsOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [slotsOpen]);

  const maxGuests = Math.max(1, sauna.capacity || 10);
  const guestsLabel = (n: number) =>
    `${n} ${n === 1 ? "гость" : n < 5 ? "гостя" : "гостей"}`;

  useEffect(() => {
    if (!selectedDate) return;
    setLoadingAvailability(true);
    setStartHour(null);
    setEndHour(null);
    const dateStr = `${selectedDate.getFullYear()}-${pad(selectedDate.getMonth() + 1)}-${pad(selectedDate.getDate())}`;
    fetch(`${API_URL}/saunas/${sauna.id}/availability?date=${dateStr}`)
      .then((r) => r.json())
      .then(setAvailability)
      .catch(() => setAvailability(null))
      .finally(() => setLoadingAvailability(false));
  }, [selectedDate, sauna.id]);

  const totalPrice = useMemo(() => {
    if (!selectedDate || startHour == null || endHour == null) return 0;
    if (!sauna.prices || sauna.prices.length === 0) return 0;
    let sum = 0;
    const dayType = getDayType(selectedDate);
    for (let h = startHour; h < endHour; h++) {
      const timeSlot = getTimeSlot(h);
      const slot = sauna.prices.find(
        (p) => p.dayType === dayType && p.timeSlot === timeSlot,
      );
      if (slot) sum += slot.pricePerHour;
    }
    return sum;
  }, [selectedDate, startHour, endHour, sauna.prices]);

  const depositAmount = Math.round((totalPrice * (sauna.depositPercent ?? 30)) / 100);
  const amountToPay = paymentType === "full" ? totalPrice : depositAmount;
  const hoursSelected = startHour != null && endHour != null ? endHour - startHour : 0;
  const minHoursValid = hoursSelected >= sauna.minHours;

  const rangeValid = useMemo(() => {
    if (!availability || startHour == null || endHour == null) return false;
    for (let h = startHour; h < endHour; h++) {
      if (isPastHour(h)) return false;
      const slot = availability.slots.find((s) => s.hour === h);
      if (!slot || !slot.available) return false;
    }
    return true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availability, startHour, endHour, isSelectedDateToday, moscowNow.hour]);

  const canProceed = !!(selectedDate && rangeValid && minHoursValid && totalPrice > 0);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else setViewMonth(viewMonth - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else setViewMonth(viewMonth + 1);
  };
  const isPast = (day: number) => {
    // Сравниваем по московским календарным датам
    if (viewYear < moscowNow.year) return true;
    if (viewYear > moscowNow.year) return false;
    if (viewMonth + 1 < moscowNow.month) return true;
    if (viewMonth + 1 > moscowNow.month) return false;
    return day < moscowNow.day;
  };
  const isSelected = (day: number) =>
    selectedDate &&
    day === selectedDate.getDate() &&
    viewMonth === selectedDate.getMonth() &&
    viewYear === selectedDate.getFullYear();

  const handleDateClick = (day: number) => {
    setSelectedDate(new Date(viewYear, viewMonth, day));
    setCalendarOpen(false);
  };

  const handleSlotClick = (hour: number) => {
    // Прошедший час — игнорируем
    if (isPastHour(hour)) return;

    // Первый клик — забронировать 1 час
    if (startHour == null) {
      setStartHour(hour);
      setEndHour(hour + 1);
      return;
    }
    // Повторный клик на стартовый час с одночасовой бронью — снимаем выделение
    if (hour === startHour && endHour === startHour + 1) {
      setStartHour(null);
      setEndHour(null);
      return;
    }
    // Клик раньше или равно старту (но не одночасовой случай) — новый старт, 1 час
    if (hour <= startHour) {
      setStartHour(hour);
      setEndHour(hour + 1);
      return;
    }
    // Клик позже старта — расширяем диапазон, но проверяем, что все
    // промежуточные слоты свободны и не в прошлом.
    if (!availability) return;
    const intermediateAvailable = availability.slots
      .filter((s) => s.hour >= startHour && s.hour <= hour)
      .every((s) => s.available && !isPastHour(s.hour));
    if (!intermediateAvailable) {
      setStartHour(hour);
      setEndHour(hour + 1);
      return;
    }
    setEndHour(hour + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || startHour == null || endHour == null) return;

    setSubmitting(true);
    setError(null);

    const dateStr = `${selectedDate.getFullYear()}-${pad(selectedDate.getMonth() + 1)}-${pad(selectedDate.getDate())}`;
    const startAt = `${dateStr}T${pad(startHour)}:00:00`;
    const endAt = `${dateStr}T${pad(endHour)}:00:00`;

    try {
      const res = await fetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName,
          phone,
          startAt,
          endAt,
          guests,
          comment: comment || undefined,
          branchId: sauna.branchId,
          saunaId: sauna.id,
          totalPrice,
          paymentType,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Не удалось создать бронь");
      }

      const confirmationUrl = data.payment?.confirmationUrl;
      if (!confirmationUrl) {
        throw new Error("Не получена ссылка на оплату");
      }

      window.location.href = confirmationUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
      setSubmitting(false);
    }
  };

  const renderSlots = () => {
    if (loadingAvailability) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-forest" />
        </div>
      );
    }
    if (!availability) {
      return (
        <p className="text-center text-sm text-muted-foreground py-4">
          Выберите дату для просмотра доступности
        </p>
      );
    }

    return (
      <div className="grid grid-cols-6 gap-1.5">
        {availability.slots.map((slot) => {
          const past = isPastHour(slot.hour);
          const inRange =
            !past &&
            startHour != null &&
            endHour != null &&
            slot.hour >= startHour &&
            slot.hour < endHour;
          const disabled = past || !slot.available;

          let cls: string;
          if (inRange) {
            cls = "bg-forest text-white";
          } else if (past) {
            cls = "bg-muted/30 text-muted-foreground/40 cursor-not-allowed";
          } else if (slot.reason === "booked") {
            cls = "bg-red-500/20 text-red-400 cursor-not-allowed";
          } else if (slot.reason === "cleaning") {
            cls = "bg-amber-500/20 text-amber-400 cursor-not-allowed";
          } else if (slot.reason === "closed") {
            cls = "bg-gray-500/20 text-gray-500 cursor-not-allowed";
          } else {
            cls = "bg-muted hover:bg-forest/20 text-foreground";
          }

          return (
            <button
              type="button"
              key={slot.hour}
              disabled={disabled}
              onClick={() => handleSlotClick(slot.hour)}
              className={`rounded py-1.5 text-xs font-medium transition-colors ${cls}`}
              title={
                past
                  ? "Время прошло"
                  : slot.reason === "booked"
                    ? "Занято"
                    : slot.reason === "cleaning"
                      ? "Уборка"
                      : slot.reason === "closed"
                        ? "Закрыто"
                        : ""
              }
            >
              {pad(slot.hour)}
            </button>
          );
        })}
      </div>
    );
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  if (step === "form") {
    return (
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="rounded-lg bg-muted/50 p-3 text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Дата:</span>
            <span className="font-medium">
              {selectedDate?.getDate()} {MONTHS_GENITIVE[selectedDate?.getMonth() ?? 0]}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Время:</span>
            <span className="font-medium">
              {pad(startHour ?? 0)}:00 — {pad(endHour ?? 0)}:00 ({hoursSelected} ч)
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Гостей:</span>
            <span className="font-medium">{guests}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-1 mt-2">
            <span className="text-muted-foreground">Полная сумма:</span>
            <span className="font-semibold">{totalPrice}₽</span>
          </div>
        </div>

        <div className="space-y-2">
          <label
            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
              paymentType === "deposit"
                ? "border-forest bg-forest/5"
                : "border-border hover:border-forest/50"
            }`}
          >
            <input
              type="radio"
              checked={paymentType === "deposit"}
              onChange={() => setPaymentType("deposit")}
              className="sr-only"
            />
            <span
              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                paymentType === "deposit"
                  ? "border-white bg-white"
                  : "border-muted-foreground/40 bg-transparent"
              }`}
            >
              {paymentType === "deposit" && (
                <span className="h-1.5 w-1.5 rounded-full bg-forest" />
              )}
            </span>
            <div className="flex-1">
              <div className="flex justify-between">
                <span className="text-sm font-medium">
                  Предоплата {sauna.depositPercent}%
                </span>
                <span className="text-sm font-semibold">{depositAmount}₽</span>
              </div>
              <p className="text-xs text-muted-foreground">Остальное на месте</p>
            </div>
          </label>

          <label
            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
              paymentType === "full"
                ? "border-forest bg-forest/5"
                : "border-border hover:border-forest/50"
            }`}
          >
            <input
              type="radio"
              checked={paymentType === "full"}
              onChange={() => setPaymentType("full")}
              className="sr-only"
            />
            <span
              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                paymentType === "full"
                  ? "border-white bg-white"
                  : "border-muted-foreground/40 bg-transparent"
              }`}
            >
              {paymentType === "full" && (
                <span className="h-1.5 w-1.5 rounded-full bg-forest" />
              )}
            </span>
            <div className="flex-1">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Полная оплата</span>
                <span className="text-sm font-semibold">{totalPrice}₽</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Сразу всю сумму онлайн
              </p>
            </div>
          </label>
        </div>

        <div className="space-y-2">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              required
              placeholder="Ваше имя"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-forest"
            />
          </div>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="tel"
              required
              placeholder="+7 (___) ___-__-__"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-forest"
            />
          </div>
          <textarea
            placeholder="Комментарий (необязательно)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-forest resize-none"
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/30 p-2.5 text-sm text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setStep("select")}
            disabled={submitting}
            className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium hover:bg-muted transition-colors"
          >
            Назад
          </button>
          <button
            type="submit"
            disabled={submitting || !clientName || !phone}
            className="flex-[2] rounded-lg bg-forest text-white py-2.5 text-sm font-semibold hover:bg-forest/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Создаём бронь...
              </>
            ) : (
              `Оплатить ${amountToPay}₽`
            )}
          </button>
        </div>
      </form>
    );
  }

  const timeRangeLabel =
    startHour != null && endHour != null
      ? `${pad(startHour)}:00 — ${pad(endHour)}:00 (${hoursSelected} ч)`
      : "Выберите время";

  return (
    <div className="space-y-3">
      {/* Дата */}
      <div>
        <button
          ref={calendarButtonRef}
          type="button"
          onClick={() => setCalendarOpen(!calendarOpen)}
          className="flex w-full items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-left hover:border-forest/50 transition-colors"
        >
          <CalendarDays className="h-4 w-4 shrink-0 text-forest" />
          <span className={selectedDate ? "" : "text-muted-foreground"}>
            {selectedDate
              ? `${selectedDate.getDate()} ${MONTHS_GENITIVE[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`
              : "Выберите дату"}
          </span>
          <ChevronDown
            className={`ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
              calendarOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {mounted &&
          createPortal(
            <AnimatePresence>
              {calendarOpen && calendarRect && (
                <motion.div
                  ref={calendarPanelRef}
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="fixed z-[200] rounded-xl border border-border bg-card p-4 shadow-2xl"
                  style={{
                    left: calendarRect.left,
                    top: calendarRect.top,
                    width: Math.max(280, calendarRect.width),
                    willChange: "transform, opacity",
                  }}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={prevMonth}
                      className="rounded-lg p-1.5 hover:bg-muted"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-semibold">
                      {MONTHS[viewMonth]} {viewYear}
                    </span>
                    <button
                      type="button"
                      onClick={nextMonth}
                      className="rounded-lg p-1.5 hover:bg-muted"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mb-2 grid grid-cols-7 gap-1">
                    {WEEKDAYS.map((d) => (
                      <div key={d} className="text-center text-xs text-muted-foreground py-1">
                        {d}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: firstDay }).map((_, i) => (
                      <div key={`empty-${i}`} />
                    ))}
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                      <button
                        type="button"
                        key={day}
                        disabled={isPast(day)}
                        onClick={() => handleDateClick(day)}
                        className={`h-9 rounded-lg text-sm transition-colors ${
                          isSelected(day)
                            ? "bg-forest text-white"
                            : isPast(day)
                              ? "text-muted-foreground/30 cursor-not-allowed"
                              : "hover:bg-muted"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>,
            document.body,
          )}
      </div>

      {/* Время — только если выбрана дата */}
      {selectedDate && (
        <div>
          <button
            ref={slotsButtonRef}
            type="button"
            onClick={() => setSlotsOpen(!slotsOpen)}
            className="flex w-full items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-left hover:border-forest/50 transition-colors"
          >
            <Clock className="h-4 w-4 shrink-0 text-forest" />
            <span className={startHour != null ? "" : "text-muted-foreground"}>
              {timeRangeLabel}
            </span>
            <ChevronDown
              className={`ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                slotsOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {mounted &&
            createPortal(
              <AnimatePresence>
                {slotsOpen && slotsRect && (
                  <motion.div
                    ref={slotsPanelRef}
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.2 }}
                    className="fixed z-[200] rounded-xl border border-border bg-card p-4 shadow-2xl"
                    style={{
                      left: slotsRect.left,
                      top: slotsRect.top,
                      width: Math.max(280, slotsRect.width),
                      willChange: "transform, opacity",
                    }}
                  >
                    <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Один клик — 1 час, второй — расширить диапазон
                    </div>
                    {renderSlots()}
                    <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-muted-foreground">
                      <span>🟢 Свободно</span>
                      <span>🔴 Занято</span>
                      <span>🟡 Уборка</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>,
              document.body,
            )}
        </div>
      )}

      <div>
        <button
          ref={guestsButtonRef}
          type="button"
          onClick={() => setGuestsOpen((p) => !p)}
          className="flex w-full items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5 text-sm transition-colors hover:border-forest/50 focus:outline-none focus:border-forest"
        >
          <Users className="h-4 w-4 shrink-0 text-forest" />
          <span className="text-muted-foreground">Гостей</span>
          <span className="ml-auto font-semibold">{guestsLabel(guests)}</span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
              guestsOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {mounted &&
          createPortal(
            <AnimatePresence>
              {guestsOpen && guestsRect && (
                <motion.div
                  ref={guestsPanelRef}
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="fixed z-[200] max-h-60 overflow-y-auto rounded-xl border border-border bg-card p-1.5 shadow-2xl"
                  style={{
                    left: guestsRect.left,
                    top: guestsRect.top,
                    width: guestsRect.width,
                    willChange: "transform, opacity",
                  }}
                >
                  {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => {
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
                        <span>{guestsLabel(n)}</span>
                        {active && <Check className="h-4 w-4 shrink-0" />}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>,
            document.body,
          )}
      </div>

      {totalPrice > 0 && (
        <div className="rounded-lg bg-forest/10 p-3 text-center">
          <div className="text-xs text-muted-foreground">Сумма</div>
          <div className="text-2xl font-bold text-forest">{totalPrice}₽</div>
          <div className="text-xs text-muted-foreground">за {hoursSelected} ч</div>
        </div>
      )}

      {!minHoursValid && hoursSelected > 0 && (
        <p className="text-xs text-amber-500 text-center">
          Минимальное время — {sauna.minHours} ч
        </p>
      )}

      <button
        type="button"
        onClick={() => {
          setStep("form");
          setError(null);
        }}
        disabled={!canProceed}
        className="w-full rounded-lg bg-forest text-white py-3 text-sm font-semibold hover:bg-forest/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Продолжить
      </button>
    </div>
  );
}
