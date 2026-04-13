"use client";

import { useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SaunaCardCarouselProps {
  images: string[];
  alt: string;
  /** Оставлено для обратной совместимости с вызывающим кодом; больше не используется. */
  sizes?: string;
}

/* eslint-disable @next/next/no-img-element */
/*
 * Карусель фото саун. Стратегия:
 *  - Рендерим только ОДНО <img> (активная картинка) — на странице может быть
 *    15+ карточек, держать 60+ DOM-img сразу убивает FPS на Mac.
 *  - Остальные картинки prefetch-им через `new Image()` при первом раскрытии
 *    карусели (клик по стрелке или hover карточки) — тогда листание мгновенное,
 *    а начальный рендер страницы не страдает.
 */
export function SaunaCardCarousel({
  images,
  alt,
}: SaunaCardCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [prefetched, setPrefetched] = useState(false);

  const prefetchAll = useCallback(() => {
    if (prefetched || images.length <= 1) return;
    setPrefetched(true);
    // Prefetch остальные картинки в фоне
    for (let i = 1; i < images.length; i++) {
      const img = new window.Image();
      img.src = images[i];
    }
  }, [images, prefetched]);

  const prev = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      prefetchAll();
      setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
    },
    [images.length, prefetchAll],
  );

  const next = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      prefetchAll();
      setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));
    },
    [images.length, prefetchAll],
  );

  // Ленивый prefetch после idle — не блокируем начальный рендер,
  // но к моменту когда пользователь потянется к карточке всё уже в кэше.
  useEffect(() => {
    if (images.length <= 1) return;
    const schedule = (cb: () => void) => {
      const win = window as Window & {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      };
      if (win.requestIdleCallback) {
        win.requestIdleCallback(cb, { timeout: 3000 });
      } else {
        setTimeout(cb, 1500);
      }
    };
    schedule(prefetchAll);
  }, [images, prefetchAll]);

  const hasMultiple = images.length > 1;

  return (
    <div onMouseEnter={prefetchAll} className="contents">
      <img
        key={images[current]}
        src={images[current]}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

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
    </div>
  );
}
