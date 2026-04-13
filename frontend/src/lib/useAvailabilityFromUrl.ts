"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { publicApi } from "./publicApi";

/**
 * Читает из URL `?date&time&endTime` (параметры быстрого бронирования) и,
 * если все три заданы — запрашивает batch-availability на этот слот.
 * Возвращает Set<saunaId> свободных саун, либо null (фильтр неактивен).
 *
 * Используется на /search и на страницах комплексов (/complex-9, /complex-50),
 * чтобы юзер, пришедший с hero quick booking, видел только реально свободные
 * сауны, а не все подряд с последующим отказом «время занято».
 */
export function useAvailabilityFromUrl(): {
  availableIds: Set<number> | null;
  loading: boolean;
  date: string | null;
  startHour: number | null;
  endHour: number | null;
} {
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date");
  const timeParam = searchParams.get("time");
  const endTimeParam = searchParams.get("endTime");

  const date = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : null;
  const startHour = parseHour(timeParam);
  const endHour = parseHour(endTimeParam);

  const [availableIds, setAvailableIds] = useState<Set<number> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (date === null || startHour === null || endHour === null) {
      setAvailableIds(null);
      return;
    }
    let aborted = false;
    setLoading(true);
    publicApi
      .getBatchAvailability(date, startHour, endHour)
      .then(({ available }) => {
        if (aborted) return;
        const ids = new Set<number>();
        for (const [id, free] of Object.entries(available)) {
          if (free) ids.add(Number(id));
        }
        setAvailableIds(ids);
      })
      .catch(() => {
        if (!aborted) setAvailableIds(new Set());
      })
      .finally(() => {
        if (!aborted) setLoading(false);
      });
    return () => {
      aborted = true;
    };
  }, [date, startHour, endHour]);

  return { availableIds, loading, date, startHour, endHour };
}

function parseHour(s: string | null): number | null {
  if (!s) return null;
  const h = parseInt(s.split(":")[0] ?? "", 10);
  return Number.isInteger(h) && h >= 0 && h <= 24 ? h : null;
}
