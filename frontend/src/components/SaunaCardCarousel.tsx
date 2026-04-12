"use client";

import { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SaunaCardCarouselProps {
  images: string[];
  alt: string;
  /** Оставлено для обратной совместимости с вызывающим кодом; больше не используется. */
  sizes?: string;
}

/* eslint-disable @next/next/no-img-element */
/*
 * Карусель фото саун. Используем нативный <img> вместо next/image —
 * все файлы уже .webp и небольшие, прогон через /_next/image endpoint
 * только добавляет задержку на холодном кэше. Нативный img грузится
 * прямо из public/ или CDN, все картинки рендерим сразу с opacity-0,
 * чтобы листание было мгновенным (браузер параллельно тянет все 4 фото
 * при появлении карточки во вьюпорте).
 */
export function SaunaCardCarousel({
  images,
  alt,
}: SaunaCardCarouselProps) {
  const [current, setCurrent] = useState(0);

  const prev = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
    },
    [images.length],
  );

  const next = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));
    },
    [images.length],
  );

  const hasMultiple = images.length > 1;

  return (
    <>
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={alt}
          loading="eager"
          decoding="async"
          className={`absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
          style={{ transition: "opacity 0.2s ease-out, transform 0.5s ease-out" }}
        />
      ))}

      {hasMultiple && (
        <>
          {/* Arrows — visible only on parent hover (group-hover) */}
          <button
            type="button"
            onClick={prev}
            className="absolute left-2 top-1/2 z-20 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-black/70"
            aria-label="Предыдущее фото"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-2 top-1/2 z-20 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-black/70"
            aria-label="Следующее фото"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-2 left-1/2 z-20 -translate-x-1/2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrent(i);
                }}
                className={`h-1.5 rounded-full transition-all ${
                  i === current
                    ? "w-4 bg-white"
                    : "w-1.5 bg-white/50 hover:bg-white/80"
                }`}
                aria-label={`Фото ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}
