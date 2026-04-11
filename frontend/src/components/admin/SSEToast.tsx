"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { onSSEEvent, type SSEEvent } from "@/lib/sse";
import {
  X,
  Bell,
  BellOff,
  Calendar,
  Star,
  Trash2,
  RefreshCw,
  Volume2,
  VolumeX,
  Volume1,
  Play,
} from "lucide-react";

interface Toast {
  id: number;
  message: string;
  type: "booking" | "update" | "delete" | "review";
}

const SOUND_STORAGE_KEY = "admin_sound_enabled";
const VOLUME_STORAGE_KEY = "admin_sound_volume";

/**
 * Воспроизводит "ding-dong" уведомление через Web Audio API.
 * @param volume — 0..1 (0 = тишина, 1 = максимум)
 */
function playNotificationSound(volume: number) {
  if (volume <= 0) return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Базовая громкость нот, на которую умножаем пользовательский volume
    const peak1 = 0.35 * volume;
    const peak2 = 0.32 * volume;

    // Первая нота
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.value = 988; // B5
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    gain1.gain.setValueAtTime(0, ctx.currentTime);
    gain1.gain.linearRampToValueAtTime(peak1, ctx.currentTime + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.4);

    // Вторая нота
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.value = 740; // F#5
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    gain2.gain.setValueAtTime(0, ctx.currentTime + 0.18);
    gain2.gain.linearRampToValueAtTime(peak2, ctx.currentTime + 0.2);
    gain2.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.65);
    osc2.start(ctx.currentTime + 0.18);
    osc2.stop(ctx.currentTime + 0.65);

    setTimeout(() => ctx.close().catch(() => {}), 800);
  } catch {
    // ignore
  }
}

export function SSEToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const initRef = useRef(false);

  // Загружаем настройку звука из localStorage
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    try {
      const saved = localStorage.getItem(SOUND_STORAGE_KEY);
      if (saved !== null) setSoundEnabled(saved === "1");
    } catch {}
  }, []);

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SOUND_STORAGE_KEY, next ? "1" : "0");
      } catch {}
      return next;
    });
  };

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

      if (shouldBeep && soundEnabled) {
        playNotificationSound();
      }

      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    });
  }, [soundEnabled]);

  return (
    <>
      {/* Кнопка переключения звука — всегда видна в углу для админки */}
      <button
        type="button"
        onClick={toggleSound}
        className="fixed bottom-4 right-4 z-40 flex items-center justify-center h-10 w-10 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:border-forest/50 transition-colors shadow-lg"
        title={soundEnabled ? "Звук включён" : "Звук выключен"}
      >
        {soundEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
      </button>

      {/* Тосты */}
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
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${tone}`}>
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
    </>
  );
}
