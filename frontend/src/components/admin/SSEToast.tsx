"use client";

import { useEffect, useState } from "react";
import { onSSEEvent, type SSEEvent } from "@/lib/sse";
import { X } from "lucide-react";

interface Toast {
  id: number;
  message: string;
  type: "info" | "success";
}

export function SSEToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    return onSSEEvent((evt: SSEEvent) => {
      let message = "";
      switch (evt.type) {
        case "new_booking":
          message = `Новая запись от ${(evt.data as Record<string, unknown>)?.clientName || "клиента"}`;
          break;
        case "booking_updated":
          message = "Запись обновлена";
          break;
        case "booking_deleted":
          message = "Запись удалена";
          break;
        case "new_review":
          message = "Получен новый отзыв";
          break;
        default:
          return;
      }

      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type: "info" }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    });
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg animate-in slide-in-from-right"
        >
          <span className="text-sm text-gray-700 dark:text-gray-300">{toast.message}</span>
          <button
            onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
