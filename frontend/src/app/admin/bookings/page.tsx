"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { onSSE } from "@/lib/sse";
import type { Booking } from "@/lib/types";
import { Check, X, Trash2 } from "lucide-react";

const statusLabels: Record<string, { label: string; class: string }> = {
  new: { label: "Новая", class: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  confirmed: { label: "Подтверждена", class: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  cancelled: { label: "Отменена", class: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  completed: { label: "Завершена", class: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400" },
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookings = () => {
    api.get<Booking[]>("/bookings").then(setBookings).catch(() => {}).finally(() => setLoading(false));
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
    if (!confirm("Удалить запись?")) return;
    try {
      await api.delete(`/bookings/${id}`);
      loadBookings();
    } catch {}
  };

  if (loading) return <div className="text-gray-500">Загрузка...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Записи</h2>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="px-4 py-3 text-left font-medium text-gray-500">Клиент</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Телефон</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Дата</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Время</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Услуга</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Специалист</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Статус</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Действия</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{b.clientName}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{b.phone}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{new Date(b.date).toLocaleDateString("ru-RU")}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{b.time}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{b.service?.name}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{b.staff?.name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusLabels[b.status]?.class}`}>
                      {statusLabels[b.status]?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {b.status === "new" && (
                        <>
                          <button onClick={() => updateStatus(b.id, "confirmed")} className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg" title="Подтвердить">
                            <Check className="h-4 w-4" />
                          </button>
                          <button onClick={() => updateStatus(b.id, "cancelled")} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="Отклонить">
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      <button onClick={() => deleteBooking(b.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="Удалить">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">Записей пока нет</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
