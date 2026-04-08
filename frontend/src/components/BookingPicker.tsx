"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock, CalendarDays } from "lucide-react";

const MONTHS = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

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
  return day === 0 ? 6 : day - 1; // Monday = 0
}

export function BookingPicker() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"date" | "time">("date");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

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
    setStep("time");
  };

  const handleTimeClick = (time: string) => {
    setSelectedTime(time);
    setIsOpen(false);
    setStep("date");
  };

  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      viewMonth === today.getMonth() &&
      viewYear === today.getFullYear()
    );
  };

  const isPast = (day: number) => {
    const date = new Date(viewYear, viewMonth, day);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return date < todayStart;
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      viewMonth === selectedDate.getMonth() &&
      viewYear === selectedDate.getFullYear()
    );
  };

  const displayText = () => {
    if (selectedDate && selectedTime) {
      return `${selectedDate.getDate()} ${MONTHS[selectedDate.getMonth()].toLowerCase()} ${selectedDate.getFullYear()}, ${selectedTime}`;
    }
    if (selectedDate) {
      return `${selectedDate.getDate()} ${MONTHS[selectedDate.getMonth()].toLowerCase()} ${selectedDate.getFullYear()}`;
    }
    return "Указать дату и время";
  };

  return (
    <div className="relative">
      <button
        onClick={() => { setIsOpen(!isOpen); setStep("date"); }}
        className="w-full flex items-center gap-3 rounded-lg border border-border bg-muted px-4 py-3 text-sm text-left transition-colors hover:border-forest/50"
      >
        <CalendarDays className="h-4 w-4 shrink-0 text-forest" />
        <span className={selectedDate ? "text-foreground" : "text-muted-foreground"}>
          {displayText()}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-border bg-card p-4 shadow-xl"
          >
            {step === "date" ? (
              <>
                {/* Month navigation */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={prevMonth}
                    className="rounded-lg p-1.5 hover:bg-muted transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-semibold">
                    {MONTHS[viewMonth]} {viewYear}
                  </span>
                  <button
                    onClick={nextMonth}
                    className="rounded-lg p-1.5 hover:bg-muted transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                {/* Weekday headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {WEEKDAYS.map((day) => (
                    <div
                      key={day}
                      className="text-center text-xs font-medium text-muted-foreground py-1"
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
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                    <button
                      key={day}
                      disabled={isPast(day)}
                      onClick={() => handleDateClick(day)}
                      className={`h-9 w-full rounded-lg text-sm font-medium transition-colors ${
                        isSelected(day)
                          ? "bg-forest text-white"
                          : isToday(day)
                          ? "bg-forest/20 text-forest"
                          : isPast(day)
                          ? "text-muted-foreground/30 cursor-not-allowed"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                {/* Time selection */}
                <div className="flex items-center gap-2 mb-4">
                  <button
                    onClick={() => setStep("date")}
                    className="rounded-lg p-1.5 hover:bg-muted transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <Clock className="h-4 w-4 text-forest" />
                  <span className="text-sm font-semibold">Выберите время</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {TIME_SLOTS.map((time) => (
                    <button
                      key={time}
                      onClick={() => handleTimeClick(time)}
                      className={`rounded-lg py-2.5 text-sm font-medium transition-colors ${
                        selectedTime === time
                          ? "bg-forest text-white"
                          : "bg-muted text-foreground hover:bg-forest/20 hover:text-forest"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
