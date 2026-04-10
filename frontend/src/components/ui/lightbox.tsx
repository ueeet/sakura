"use client";

import { useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface LightboxProps {
  images: string[];
  openIndex: number | null;
  onClose: () => void;
  onChangeIndex: (index: number) => void;
  alt?: string;
}

export function Lightbox({
  images,
  openIndex,
  onClose,
  onChangeIndex,
  alt = "Фото",
}: LightboxProps) {
  const isOpen = openIndex !== null;

  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && openIndex! > 0) {
        onChangeIndex(openIndex! - 1);
      }
      if (e.key === "ArrowRight" && openIndex! < images.length - 1) {
        onChangeIndex(openIndex! + 1);
      }
    };

    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, openIndex, images.length, onClose, onChangeIndex]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={onClose}
        >
          {/* Close button */}
          <button
            type="button"
            aria-label="Закрыть"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Prev arrow */}
          {openIndex! > 0 && (
            <button
              type="button"
              aria-label="Предыдущее фото"
              onClick={(e) => {
                e.stopPropagation();
                onChangeIndex(openIndex! - 1);
              }}
              className="absolute left-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 md:left-8"
            >
              <ChevronLeft className="h-7 w-7" />
            </button>
          )}

          {/* Next arrow */}
          {openIndex! < images.length - 1 && (
            <button
              type="button"
              aria-label="Следующее фото"
              onClick={(e) => {
                e.stopPropagation();
                onChangeIndex(openIndex! + 1);
              }}
              className="absolute right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 md:right-8"
            >
              <ChevronRight className="h-7 w-7" />
            </button>
          )}

          {/* Image */}
          <motion.div
            key={openIndex}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="relative h-[85vh] w-[90vw] max-w-6xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[openIndex!]}
              alt={`${alt} ${openIndex! + 1}`}
              fill
              sizes="90vw"
              className="object-contain"
              priority
            />
          </motion.div>

          {/* Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white backdrop-blur">
              {openIndex! + 1} / {images.length}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
