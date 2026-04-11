"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { onSSE } from "@/lib/sse";
import type { Booking } from "@/lib/types";
import { Check, X, Trash2, Loader2 } from "lucide-react";

const statusLabels: Record<string, { label: string; class: string }> = {
  pending_payment: {
    label: "Ожидает оплаты",
    class: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  },
  new: {
    label: "Новая",
    class: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
  },
  confirmed: {
    label: "Подтверждена",
    class: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  },
  cancelled: {
    label: "Отменена",
    class: "bg-red-500/15 text-red-400 border border-red-500/30",
  },
  completed: {
    label: "Завершена",
    class: "bg-muted text-muted-foreground border border-border",
  },
};

const paymentStatusLabels: Record<string, { label: string; class: string }> = {
  pending: { label: "—", class: "text-muted-foreground" },
  deposit_paid: { label: "Депозит", class: "text-blue-400" },
  fully_paid: { label: "Полная", class: "text-emerald-400" },
  refunded: { label: "Возврат", class: "text-red-400" },
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", {
    timeZone: "Europe/Moscow",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatHours(start: string, end: string) {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.round(ms / 3_600_000);
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookings = () => {
    api
      .get<Booking[]>("/bookings")
      .then(setBookings)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBookings();
    return onSSE(loadBookings);
  }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.put(`/bookings/${id}`, { status });
      loadBookings();
    } catch {}
  };

  const deleteBooking = async (id: number) => {
    if (!confirm("Удалить бронь?")) return;
    try {
      await api.delete(`/bookings/${id}`);
      loadBookings();
    } catch {}
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Брони</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {bookings.length === 0
            ? "Броней пока нет"
            : `Всего: ${bookings.length}`}
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Клиент</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Телефон</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Начало</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Конец</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Часов</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Гостей</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Филиал</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Сауна</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Сумма</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Оплата</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Статус</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Действия</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr
                  key={b.id}
                  className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 py-3 text-foreground font-medium">{b.clientName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{b.phone}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDateTime(b.startAt)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDateTime(b.endAt)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatHours(b.startAt, b.endAt)} ч</td>
                  <td className="px-4 py-3 text-muted-foreground">{b.guests}</td>
                  <td className="px-4 py-3 text-muted-foreground">{b.branch?.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{b.sauna?.name}</td>
                  <td className="px-4 py-3 text-foreground font-semibold">
                    {b.totalPrice ? `${b.totalPrice}₽` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium ${
                        paymentStatusLabels[b.paymentStatus]?.class ||
                        "text-muted-foreground"
                      }`}
                    >
                      {paymentStatusLabels[b.paymentStatus]?.label || "—"}
                      {b.paidAmount > 0 && ` (${b.paidAmount}₽)`}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        statusLabels[b.status]?.class
                      }`}
                    >
                      {statusLabels[b.status]?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {b.status === "new" && (
                        <>
                          <button
                            onClick={() => updateStatus(b.id, "confirmed")}
                            className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                            title="Подтвердить"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => updateStatus(b.id, "cancelled")}
                            className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Отклонить"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => deleteBooking(b.id)}
                        className="p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Удалить"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={12} className="px-4 py-12 text-center text-muted-foreground">
                    Броней пока нет
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
