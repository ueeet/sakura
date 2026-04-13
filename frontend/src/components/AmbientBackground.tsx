"use client";

/**
 * Декоративный фон, лежит fixed под всем контентом (-z-10).
 * Hero перекрывает его своим bg-black + видео; на остальных секциях
 * проступает сквозь прозрачные секции и разбавляет плоский коричневый фон.
 *
 * Раньше блики дрейфовали через framer-motion, но три огромных blur-3xl
 * пятна (60vw × 60vw) в постоянной анимации убивали FPS на Mac/Safari —
 * GPU заново растрировал blur каждый кадр. Сейчас они статичные:
 * визуально с blur(64px) разница между подвижным и неподвижным пятном
 * почти не воспринимается, а главный поток разгружен.
 */
export function AmbientBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute -top-[20%] -right-[15%] h-[60vw] w-[60vw] rounded-full bg-wood/5 blur-3xl" />
      <div className="absolute top-[35%] -left-[15%] h-[55vw] w-[55vw] rounded-full bg-sand/7 blur-3xl" />
      <div className="absolute -bottom-[20%] left-[25%] h-[55vw] w-[55vw] rounded-full bg-forest/3 blur-3xl" />
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: "url(/noise.svg)",
          backgroundSize: "200px 200px",
        }}
      />
    </div>
  );
}
