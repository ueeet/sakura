"use client";

import { useEffect, useRef } from "react";

const CURSOR_SIZE = 20;

export function PetalCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const mouseXRef = useRef(-200);
  const mouseYRef = useRef(-200);
  const visibleRef = useRef(false);

  useEffect(() => {
    // Skip on touch devices — нет hover, кастомный курсор бессмыслен
    if (window.matchMedia("(hover: none)").matches) return;

    const hideCursor = () => {
      if (cursorRef.current) {
        cursorRef.current.style.opacity = "0";
        visibleRef.current = false;
      }
    };
    const showCursor = () => {
      if (cursorRef.current) {
        cursorRef.current.style.opacity = "1";
        visibleRef.current = true;
      }
    };

    const handleMove = (e: MouseEvent) => {
      mouseXRef.current = e.clientX;
      mouseYRef.current = e.clientY;
      if (!visibleRef.current) showCursor();
    };

    // Когда мышь уходит за пределы document'а (за окно браузера) — прячем.
    const handleLeave = () => hideCursor();

    // rAF loop для позиционирования — пишет напрямую в transform, минуя React.
    let rafId: number;
    const updateCursor = () => {
      if (cursorRef.current && visibleRef.current) {
        cursorRef.current.style.transform = `translate3d(${mouseXRef.current}px, ${mouseYRef.current}px, 0)`;
      }
      rafId = requestAnimationFrame(updateCursor);
    };
    rafId = requestAnimationFrame(updateCursor);

    window.addEventListener("mousemove", handleMove, { passive: true });
    document.addEventListener("mouseleave", handleLeave);

    // ---- iframe-aware ----
    // Когда мышь заходит на cross-origin <iframe>, родительский документ
    // перестаёт получать mousemove — наш кастомный курсор «застревает» на
    // границе. Плюс внутри iframe мы НЕ можем спрятать системный курсор
    // (это другой документ). Решение: при mouseenter на iframe прячем наш
    // курсор и убираем `cursor: none` с body, чтобы Windows показал свой
    // дефолтный. При mouseleave — возвращаем как было.
    //
    // То же самое для <video controls> — там браузер сам рисует UI и наш
    // курсор мешает. Сейчас в проекте таких нет, но это профилактика.

    const enterIframe = () => {
      hideCursor();
      document.body.classList.add("cursor-system-fallback");
    };
    const leaveIframe = () => {
      document.body.classList.remove("cursor-system-fallback");
      // showCursor сработает на следующем mousemove, не нужно вручную.
    };

    const interactiveSelectors = "iframe, video[controls]";

    // Собираем существующие элементы и навешиваем listeners.
    const attached = new WeakSet<Element>();
    const attachTo = (el: Element) => {
      if (attached.has(el)) return;
      attached.add(el);
      el.addEventListener("mouseenter", enterIframe);
      el.addEventListener("mouseleave", leaveIframe);
    };
    document.querySelectorAll(interactiveSelectors).forEach(attachTo);

    // MutationObserver — ловим iframe/video, добавленные позже (например,
    // ленивый рендер карты при попадании в viewport).
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches?.(interactiveSelectors)) attachTo(node);
          node.querySelectorAll?.(interactiveSelectors).forEach(attachTo);
        });
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseleave", handleLeave);
      cancelAnimationFrame(rafId);
      observer.disconnect();
      document
        .querySelectorAll(interactiveSelectors)
        .forEach((el) => {
          el.removeEventListener("mouseenter", enterIframe);
          el.removeEventListener("mouseleave", leaveIframe);
        });
      document.body.classList.remove("cursor-system-fallback");
    };
  }, []);

  return (
    // PNG используется как mask: цвет задаётся background, форма — strelka.png.
    // Цвет берём из --wood-light (oklch(0.72 0.06 65)) — самый светлый
    // коричнево-бежевый из темы. Хорошо читается и на тёмном hero-видео,
    // и на тёмном bg-background, не сливается с зелёными акцентами.
    <div
      ref={cursorRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 select-none bg-wood-light"
      style={{
        width: CURSOR_SIZE,
        height: CURSOR_SIZE,
        opacity: 0,
        willChange: "transform",
        zIndex: 9999,
        WebkitMaskImage: "url('/strelka.png')",
        maskImage: "url('/strelka.png')",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        // Усиленная тёмная тень — сильнее контурит светлый бежевый курсор
        // на любом фоне (особенно на светлых картинках саун в коллаже).
        filter:
          "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.7)) drop-shadow(0 0 1px rgba(0, 0, 0, 0.9))",
      }}
    />
  );
}
