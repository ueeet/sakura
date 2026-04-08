"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Link from "next/link";

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline();
    tl.from(".hero-title", { y: 60, opacity: 0, duration: 0.8, ease: "power3.out" })
      .from(".hero-subtitle", { y: 40, opacity: 0, duration: 0.6, ease: "power3.out" }, "-=0.4")
      .from(".hero-btn", { y: 30, opacity: 0, duration: 0.5, ease: "power3.out" }, "-=0.3");
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-rose-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-72 h-72 bg-pink-200/30 dark:bg-pink-800/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-rose-200/20 dark:bg-rose-800/10 rounded-full blur-3xl" />
      </div>

      <div className="relative text-center px-4 max-w-4xl mx-auto">
        <h1 className="hero-title text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6">
          Добро пожаловать в{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">
            Сакура
          </span>
        </h1>
        <p className="hero-subtitle text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          Профессиональные услуги высочайшего качества. Запишитесь онлайн и оцените наш сервис.
        </p>
        <div className="hero-btn flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/services"
            className="px-8 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-pink-500/25"
          >
            Наши услуги
          </Link>
          <Link
            href="/contacts"
            className="px-8 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl font-medium transition-colors"
          >
            Контакты
          </Link>
        </div>
      </div>
    </section>
  );
}
