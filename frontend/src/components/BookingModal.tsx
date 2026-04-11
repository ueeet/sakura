"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { BookingPicker } from "./BookingPicker";
import type { Sauna } from "@/lib/types";

interface BookingModalProps {
  sauna: Sauna | null;
  onClose: () => void;
}

export function BookingModal({ sauna, onClose }: BookingModalProps) {
  // Закрытие по Escape
  useEffect(() => {
    if (!sauna) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    // Блокируем скролл body
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [sauna, onClose]);

  return (
    <AnimatePresence>
      {sauna && (
        <motion.div
          key="booking-modal"
          className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{ willChange: "opacity" }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border-2 border-forest bg-gradient-to-b from-forest/15 to-card shadow-2xl"
            style={{ willChange: "transform, opacity" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 z-10 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Закрыть"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-6 pt-7">
              {/* Заголовок с инфо о сауне */}
              <div className="mb-5 pr-8">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Бронирование
                </p>
                <h3 className="mt-1 text-2xl font-semibold">{sauna.name}</h3>
                {sauna.typeLabel && sauna.sizeLabel && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {sauna.typeLabel} · {sauna.sizeLabel}
                  </p>
                )}
                {sauna.priceFrom != null && (
                  <p className="mt-2 text-sm font-medium text-forest">
                    от {sauna.priceFrom}₽/час
                  </p>
                )}
              </div>

              <BookingPicker sauna={sauna} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
