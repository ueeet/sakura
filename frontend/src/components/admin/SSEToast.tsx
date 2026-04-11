"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { onSSEEvent, type SSEEvent } from "@/lib/sse";
import { soundStore, playNotificationSound } from "@/lib/soundStore";
import { X, Calendar, Star, Trash2, RefreshCw } from "lucide-react";

interface Toast {
  id: number;
  message: string;
  type: "booking" | "update" | "delete" | "review";
}

export function SSEToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    return onSSEEvent((evt: SSEEvent) => {
      let message = "";
      let type: Toast["type"] = "update";
      let shouldBeep = false;

      switch (evt.type) {
        case "new_booking": {
          const name = (evt.data as Record<string, unknown>)?.clientName || "клиента";
          message = `Новая бронь от ${name}`;
          type = "booking";
          shouldBeep = true;
          break;
        }
        case "booking_updated":
          message = "Бронь обновлена";
          type = "update";
          break;
        case "booking_deleted":
          message = "Бронь удалена";
          type = "delete";
          break;
        case "new_review":
          message = "Новый отзыв на модерации";
          type = "review";
          shouldBeep = true;
          break;
        case "payment_received": {
          const data = evt.data as Record<string, unknown>;
          const booking = data?.booking as Record<string, unknown> | undefined;
          message = `Оплата получена: ${booking?.clientName || "бронь"}`;
          type = "booking";
          shouldBeep = true;
          break;
        }
        default:
          return;
      }

      // Читаем актуальные настройки из store на момент события
      if (shouldBeep && soundStore.getEnabled()) {
        playNotificationSound(soundStore.getVolume());
      }

      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    });
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const Icon =
            toast.type === "booking"
              ? Calendar
              : toast.type === "review"
                ? Star
                : toast.type === "delete"
                  ? Trash2
                  : RefreshCw;
          const tone =
            toast.type === "booking"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
              : toast.type === "review"
                ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-400"
                : toast.type === "delete"
                  ? "border-red-500/40 bg-red-500/10 text-red-400"
                  : "border-blue-500/40 bg-blue-500/10 text-blue-400";

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 32, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 32, scale: 0.95 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              style={{ willChange: "transform, opacity" }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 bg-card backdrop-blur-md shadow-2xl"
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${tone}`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-sm text-foreground flex-1">{toast.message}</span>
              <button
                onClick={() =>
                  setToasts((prev) => prev.filter((t) => t.id !== toast.id))
                }
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
