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
  // Закрытие по Escape (скролл страницы НЕ блокируем)
  useEffect(() => {
    if (!sauna) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
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
            className="relative flex w-full max-w-md max-h-[90vh] flex-col rounded-t-2xl sm:rounded-2xl border-2 border-forest bg-card shadow-2xl overflow-hidden"
            style={{ willChange: "transform, opacity" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky header */}
            <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-border bg-card/95 backdrop-blur p-5">
              <div className="flex-1">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Бронирование
                </p>
                <h3 className="mt-1 text-xl font-semibold leading-tight">{sauna.name}</h3>
                {sauna.typeLabel && sauna.sizeLabel && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {sauna.typeLabel} · {sauna.sizeLabel}
                  </p>
                )}
                {sauna.priceFrom != null && (
                  <p className="mt-1 text-xs font-medium text-forest">
                    от {sauna.priceFrom}₽/час
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="Закрыть"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-5">
              <BookingPicker sauna={sauna} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
