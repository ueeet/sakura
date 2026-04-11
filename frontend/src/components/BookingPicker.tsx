"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CalendarDays,
  Users,
  User,
  Phone,
  Loader2,
  AlertCircle,
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

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [calendarOpen, setCalendarOpen] = useState(false);

  const [availability, setAvailability] = useState<SaunaAvailability | null>(null);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const slot = availability.slots.find((s) => s.hour === h);
      if (!slot || !slot.available) return false;
    }
    return true;
  }, [availability, startHour, endHour]);

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
    const d = new Date(viewYear, viewMonth, day);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return d < todayStart;
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
    // промежуточные слоты свободны. Иначе начинаем заново с этого часа.
    if (!availability) return;
    const intermediateAvailable = availability.slots
      .filter((s) => s.hour >= startHour && s.hour <= hour)
      .every((s) => s.available);
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
          const inRange =
            startHour != null &&
            endHour != null &&
            slot.hour >= startHour &&
            slot.hour < endHour;
          const disabled = !slot.available;
          const reasonClass =
            slot.reason === "booked"
              ? "bg-red-500/20 text-red-400 cursor-not-allowed"
              : slot.reason === "cleaning"
                ? "bg-amber-500/20 text-amber-400 cursor-not-allowed"
                : "bg-gray-500/20 text-gray-500 cursor-not-allowed";
          const activeClass = inRange
            ? "bg-forest text-white"
            : disabled
              ? reasonClass
              : "bg-muted hover:bg-forest/20 text-foreground";
          return (
            <button
              type="button"
              key={slot.hour}
              disabled={disabled}
              onClick={() => handleSlotClick(slot.hour)}
              className={`rounded py-1.5 text-xs font-medium transition-colors ${activeClass}`}
              title={
                slot.reason === "booked"
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
          <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-border p-2.5 hover:border-forest/50">
            <input
              type="radio"
              checked={paymentType === "deposit"}
              onChange={() => setPaymentType("deposit")}
              className="mt-0.5"
            />
            <div className="flex-1">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Предоплата {sauna.depositPercent}%</span>
                <span className="text-sm font-semibold">{depositAmount}₽</span>
              </div>
              <p className="text-xs text-muted-foreground">Остальное на месте</p>
            </div>
          </label>
          <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-border p-2.5 hover:border-forest/50">
            <input
              type="radio"
              checked={paymentType === "full"}
              onChange={() => setPaymentType("full")}
              className="mt-0.5"
            />
            <div className="flex-1">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Полная оплата</span>
                <span className="text-sm font-semibold">{totalPrice}₽</span>
              </div>
              <p className="text-xs text-muted-foreground">Сразу всю сумму онлайн</p>
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

  return (
    <div className="space-y-3">
      <div className="relative">
        <button
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
        </button>
        <AnimatePresence>
          {calendarOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-border bg-card p-4 shadow-xl"
              style={{ willChange: "transform, opacity" }}
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
        </AnimatePresence>
      </div>

      {selectedDate && (
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            Один клик — 1 час, второй клик — расширить диапазон
          </div>
          {renderSlots()}
          <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-muted-foreground">
            <span>🟢 Свободно</span>
            <span>🔴 Занято</span>
            <span>🟡 Уборка</span>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2">
        <Users className="h-4 w-4 text-forest" />
        <span className="text-sm">Гостей</span>
        <input
          type="number"
          min={1}
          max={50}
          value={guests}
          onChange={(e) => setGuests(Math.max(1, parseInt(e.target.value) || 1))}
          className="ml-auto w-16 bg-transparent text-right text-sm font-semibold focus:outline-none"
        />
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
