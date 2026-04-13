"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Users, SlidersHorizontal, X, Clock } from "lucide-react";
import type { Sauna, SaunaType } from "@/lib/types";
import { DatePopover } from "@/components/DatePopover";

const TYPE_OPTIONS: { value: SaunaType; label: string }[] = [
  { value: "russian", label: "Русская баня" },
  { value: "finnish", label: "Финская сауна" },
  { value: "hamam", label: "Хамам" },
];

const CAPACITY_OPTIONS = [
  { value: 0, label: "Любая" },
  { value: 4, label: "от 4" },
  { value: 6, label: "от 6" },
  { value: 10, label: "от 10" },
];

type SortOption = "default" | "price_asc" | "price_desc";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "default", label: "По умолчанию" },
  { value: "price_asc", label: "Сначала дешевле" },
  { value: "price_desc", label: "Сначала дороже" },
];

export interface SaunaFilterState {
  types: SaunaType[];
  minCapacity: number;
  sort: SortOption;
  // Расписание (опционально). Если все три заданы — SearchView фильтрует
  // список по реальной свободности через batch-эндпоинт.
  date: string | null;       // "YYYY-MM-DD"
  startHour: number | null;  // 0..23
  endHour: number | null;    // 1..24, > startHour
}

export const defaultFilters: SaunaFilterState = {
  types: [],
  minCapacity: 0,
  sort: "default",
  date: null,
  startHour: null,
  endHour: null,
};

export function hasActiveFilters(f: SaunaFilterState): boolean {
  return f.types.length > 0 || f.minCapacity > 0 || f.sort !== "default" ||
    f.date !== null || f.startHour !== null || f.endHour !== null;
}

export function hasScheduleFilter(f: SaunaFilterState): boolean {
  return f.date !== null && f.startHour !== null && f.endHour !== null;
}

export function applyFilters(saunas: Sauna[], filters: SaunaFilterState): Sauna[] {
  let result = saunas;

  if (filters.types.length > 0) {
    result = result.filter((s) => filters.types.includes(s.type));
  }

  if (filters.minCapacity > 0) {
    result = result.filter((s) => s.capacity >= filters.minCapacity);
  }

  if (filters.sort === "price_asc") {
    result = [...result].sort((a, b) => (a.priceFrom ?? 0) - (b.priceFrom ?? 0));
  } else if (filters.sort === "price_desc") {
    result = [...result].sort((a, b) => (b.priceFrom ?? 0) - (a.priceFrom ?? 0));
  }

  return result;
}

interface SaunaFiltersProps {
  filters: SaunaFilterState;
  onChange: (f: SaunaFilterState) => void;
  saunas: Sauna[];
  /**
   * Показывать ли строку выбора даты+времени. Нужна только на /search,
   * где юзер ищет свободный слот в масштабе всей сети. На страницах
   * конкретного комплекса (9/50) мы показываем ВСЕ сауны — дата/время
   * спрашивается уже в модалке бронирования.
   */
  showSchedule?: boolean;
}

export function SaunaFilters({ filters, onChange, saunas, showSchedule = true }: SaunaFiltersProps) {
  const availableTypes = useMemo(() => {
    const set = new Set(saunas.map((s) => s.type));
    return TYPE_OPTIONS.filter((t) => set.has(t.value));
  }, [saunas]);

  const toggleType = (type: SaunaType) => {
    const next = filters.types.includes(type)
      ? filters.types.filter((t) => t !== type)
      : [...filters.types, type];
    onChange({ ...filters, types: next });
  };

  const active = hasActiveFilters(filters);
  const scheduleActive = filters.date !== null || filters.startHour !== null || filters.endHour !== null;

  const setStartHour = (v: number | null) => {
    // Если новый start ≥ end — сдвигаем end к start+2 (макс 24)
    const endH = v !== null && filters.endHour !== null && filters.endHour <= v
      ? Math.min(24, v + 2)
      : filters.endHour;
    onChange({ ...filters, startHour: v, endHour: endH });
  };

  const selectArrowStyle: React.CSSProperties = {
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 10px center",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      style={{ willChange: "transform, opacity" }}
      className="relative z-30 mb-8 rounded-2xl border border-border bg-card/50 px-5 py-4"
    >
      {/* Schedule row — даёт юзеру быстро менять дату/время прямо в списке.
          Когда заданы все три (date + startHour + endHour) — SearchView
          фильтрует карточки по реальной свободности слота. */}
      {showSchedule && (
      <div className="mb-3 flex flex-wrap items-center gap-2 pb-3 border-b border-border/60">
        <DatePopover
          value={filters.date}
          onChange={(v) => onChange({ ...filters, date: v })}
          placeholder="Дата"
        />

        <Clock className="ml-2 h-4 w-4 text-muted-foreground" />
        <select
          value={filters.startHour ?? ""}
          onChange={(e) => setStartHour(e.target.value === "" ? null : Number(e.target.value))}
          className="appearance-none rounded-full bg-muted pl-4 pr-8 py-2 text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-forest"
          style={selectArrowStyle}
        >
          <option value="">с</option>
          {Array.from({ length: 24 }, (_, h) => (
            <option key={h} value={h}>{String(h).padStart(2, "0")}:00</option>
          ))}
        </select>
        <span className="text-sm text-muted-foreground/60">→</span>
        <select
          value={filters.endHour ?? ""}
          onChange={(e) => onChange({ ...filters, endHour: e.target.value === "" ? null : Number(e.target.value) })}
          disabled={filters.startHour === null}
          className="appearance-none rounded-full bg-muted pl-4 pr-8 py-2 text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-forest disabled:opacity-50 disabled:cursor-not-allowed"
          style={selectArrowStyle}
        >
          <option value="">до</option>
          {Array.from({ length: 24 }, (_, i) => i + 1)
            .filter((h) => filters.startHour === null || h > filters.startHour)
            .map((h) => (
              <option key={h} value={h}>{String(h).padStart(2, "0")}:00</option>
            ))}
        </select>

        {scheduleActive && (
          <button
            type="button"
            onClick={() => onChange({ ...filters, date: null, startHour: null, endHour: null })}
            className="ml-1 inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-3 w-3" />
            Очистить
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <SlidersHorizontal className="h-4.5 w-4.5 text-muted-foreground" />

        {/* Type toggles */}
        {availableTypes.map((opt) => {
          const on = filters.types.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggleType(opt.value)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                on
                  ? "bg-forest text-white"
                  : "bg-muted text-foreground hover:bg-muted/80"
              }`}
            >
              {opt.label}
            </button>
          );
        })}

        <span className="mx-1.5 h-6 w-px bg-border" />

        {/* Capacity */}
        <div className="flex items-center gap-1.5">
          <Users className="h-4 w-4 text-muted-foreground" />
          {CAPACITY_OPTIONS.map((opt) => {
            const on = filters.minCapacity === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ ...filters, minCapacity: opt.value })}
                className={`rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                  on
                    ? "bg-forest text-white"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        <span className="mx-1.5 h-6 w-px bg-border" />

        {/* Sort */}
        <select
          value={filters.sort}
          onChange={(e) => onChange({ ...filters, sort: e.target.value as SortOption })}
          className="appearance-none rounded-full bg-muted pl-4 pr-8 py-2 text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-forest"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Reset */}
        {active && (
          <button
            type="button"
            onClick={() => onChange(defaultFilters)}
            className="ml-auto flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            Сбросить
          </button>
        )}
      </div>
    </motion.div>
  );
}
