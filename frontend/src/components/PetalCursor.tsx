"use client";

import { useEffect, useRef } from "react";

const CURSOR_SIZE = 26;
const TAIL_OFFSET_X = 15;
const TAIL_OFFSET_Y = 18;
const POOL_SIZE = 24;
const SPAWN_INTERVAL = 50; // ms — at most 20 petals/sec, plenty for trail
const PETAL_LIFETIME = 1600; // ms — must match CSS animation duration

export function PetalCursor() {
  const cursorRef = useRef<HTMLImageElement>(null);
  const poolRef = useRef<HTMLImageElement[]>([]);
  const nextPoolIdxRef = useRef(0);
  const lastSpawnRef = useRef(0);
  const mouseXRef = useRef(-200);
  const mouseYRef = useRef(-200);
  const visibleRef = useRef(false);

  useEffect(() => {
    // Skip on touch devices
    if (window.matchMedia("(hover: none)").matches) return;

    const handleMove = (e: MouseEvent) => {
      mouseXRef.current = e.clientX;
      mouseYRef.current = e.clientY;

      if (!visibleRef.current && cursorRef.current) {
        cursorRef.current.style.opacity = "1";
        visibleRef.current = true;
      }

      // Spawn petal (throttled)
      const now = e.timeStamp;
      if (now - lastSpawnRef.current >= SPAWN_INTERVAL) {
        lastSpawnRef.current = now;
        spawnPetal(e.clientX + TAIL_OFFSET_X, e.clientY + TAIL_OFFSET_Y);
      }
    };

    const handleLeave = () => {
      if (cursorRef.current) {
        cursorRef.current.style.opacity = "0";
        visibleRef.current = false;
      }
    };

    const spawnPetal = (x: number, y: number) => {
      const pool = poolRef.current;
      if (pool.length === 0) return;

      const el = pool[nextPoolIdxRef.current];
      nextPoolIdxRef.current = (nextPoolIdxRef.current + 1) % POOL_SIZE;
      if (!el) return;

      const startRot = Math.floor(Math.random() * 360);
      const endRot = startRot + 180 + Math.floor(Math.random() * 80);
      const drift = Math.floor((Math.random() - 0.5) * 70);
      const scale = (0.4 + Math.random() * 0.5).toFixed(2);

      // Reset animation by toggling class
      el.classList.remove("active");
      // Force reflow so the animation restarts
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      void el.offsetWidth;

      el.style.setProperty("--start-x", `${x - 16}px`);
      el.style.setProperty("--start-y", `${y - 16}px`);
      el.style.setProperty("--end-x", `${x - 16 + drift}px`);
      el.style.setProperty("--end-y", `${y - 16 + 130}px`);
      el.style.setProperty("--start-rot", `${startRot}deg`);
      el.style.setProperty("--end-rot", `${endRot}deg`);
      el.style.setProperty("--scale", scale);

      el.classList.add("active");
    };

    // rAF loop for cursor positioning — runs only when needed (paused when tab hidden)
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

    return () => {
      window.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseleave", handleLeave);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      {/* Pre-rendered pool of petal DOM nodes — direct CSS animation, no React updates */}
      {Array.from({ length: POOL_SIZE }).map((_, i) => (
        <img
          key={i}
          ref={(el) => {
            if (el) poolRef.current[i] = el;
          }}
          src="/petal.png"
          alt=""
          className="petal-trail"
          style={{ zIndex: 9998 }}
        />
      ))}

      {/* Main cursor — direct DOM positioning via rAF */}
      <img
        ref={cursorRef}
        src="/strelka.png"
        alt=""
        className="pointer-events-none fixed left-0 top-0 select-none"
        style={{
          width: CURSOR_SIZE,
          height: CURSOR_SIZE,
          opacity: 0,
          willChange: "transform",
          zIndex: 9999,
          filter: "drop-shadow(0 2px 6px rgba(244, 114, 182, 0.4))",
        }}
        draggable={false}
      />
    </>
  );
}
