"use client";

import { motion } from "framer-motion";

/**
 * Декоративный фон, лежит fixed под всем контентом (-z-10).
 * Hero перекрывает его своим bg-black + видео; на остальных секциях
 * (about/promotions/contacts/reviews) проступает сквозь прозрачные секции
 * и разбавляет плоский коричневый фон body.
 *
 * Слои:
 *   1. 3 больших радиальных «блика» (тёплый wood / sand / forest), очень
 *      медленный дрейф через framer-motion — оживляет фон без перетягивания
 *      внимания.
 *   2. Тонкая SVG-шумовая текстура поверх — даёт «премиум»-фактуру вместо
 *      плоской заливки.
 */
export function AmbientBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <motion.div
        className="absolute -top-[20%] -right-[15%] h-[60vw] w-[60vw] rounded-full bg-wood/5 blur-3xl"
        animate={{ x: [0, 40, -20, 0], y: [0, 30, -10, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[35%] -left-[15%] h-[55vw] w-[55vw] rounded-full bg-sand/7 blur-3xl"
        animate={{ x: [0, -30, 20, 0], y: [0, -40, 20, 0] }}
        transition={{ duration: 34, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-[20%] left-[25%] h-[55vw] w-[55vw] rounded-full bg-forest/3 blur-3xl"
        animate={{ x: [0, 30, -30, 0], y: [0, 20, -20, 0] }}
        transition={{ duration: 40, repeat: Infinity, ease: "easeInOut" }}
      />
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
