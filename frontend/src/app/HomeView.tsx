"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroQuickBooking } from "@/components/HeroQuickBooking";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNavigation,
  CarouselIndicator,
} from "@/components/ui/carousel";
import { Lightbox } from "@/components/ui/lightbox";
import type { Promotion } from "@/lib/types";
import { Flame, Gift, Cake, ChevronDown, Phone, MapPin } from "lucide-react";
import { motion } from "framer-motion";

const promoIcons: Record<string, React.ReactNode> = {
  flame: <Flame className="h-8 w-8 text-forest" />,
  gift: <Gift className="h-8 w-8 text-forest" />,
  cake: <Cake className="h-8 w-8 text-forest" />,
};

const carouselSlides = [
  { title: "Русская баня", image: "/images/saunas/complex-9/family/2/1.webp" },
  { title: "Финская сауна", image: "/images/saunas/complex-9/family/1/1.webp" },
  { title: "Турецкий хамам", image: "/images/saunas/complex-9/family/4/1.webp" },
  { title: "Бассейн", image: "/images/saunas/complex-9/regular/1/1.webp" },
  { title: "Комната отдыха", image: "/images/saunas/complex-9/family/3/2.webp" },
  { title: "Шашлычная", image: "/images/saunas/complex-50/1/1.webp" },
];

const mapSrc = "https://yandex.ru/map-widget/v1/?ll=52.406%2C55.750&z=12&pt=52.389442,55.726188,pm2gnm1~52.422554,55.773935,pm2gnm2";

const yandexLinks = {
  complex9: "https://yandex.ru/maps/?pt=52.389442,55.726188&z=16&l=map",
  complex50: "https://yandex.ru/maps/?pt=52.422554,55.773935&z=16&l=map",
};

// Variants для каскадной анимации hero-блока (h1 → подзаголовок → кнопки).
// Плашка HeroQuickBooking — сиблинг ниже, ей выставлен совпадающий delay вручную.
const HERO_ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" as const },
  },
};

export default function HomePage() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <Header />
      <main>
        {/* ===== HERO ===== */}
        <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black px-4 pb-16 pt-24 sm:pb-24 md:pb-32 md:pt-28">
          {/* Video background */}
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover"
          >
            <source src="/hero.mp4" type="video/mp4" />
          </video>

          {/* Base dim — слегка приглушает всё видео для читаемости */}
          <div className="pointer-events-none absolute inset-0 bg-black/40" />

          {/* Vignette — тёмные края, прозрачный центр */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 90% 75% at 50% 50%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.45) 75%, rgba(0,0,0,0.85) 100%)",
            }}
          />

          {/* Hero stagger: каждый ребёнок (h1 → p → кнопки → плашка) выезжает
              с задержкой 0.18s через staggerChildren. Плашка лежит сиблингом
              ниже, поэтому ей выставлен совпадающий delay вручную. */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.18, delayChildren: 0.1 },
              },
            }}
            // scale 1.2375 — только на md+. На мобиле он выдавливал контент за края
            // viewport (414px), из-за чего «Крупнейшая» обрезалась слева, а кнопки
            // вылезали за горизонталь.
            className="relative z-10 flex flex-col items-center text-center md:scale-[1.2375]"
          >
            {/* Общая тень-подложка под заголовком, подзаголовком и кнопками */}
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[180%] w-[180%] -translate-x-1/2 -translate-y-1/2"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.4) 30%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0) 85%)",
                filter: "blur(30px)",
              }}
            />

            <motion.h1
              variants={HERO_ITEM_VARIANTS}
              className="font-heading text-6xl tracking-wider text-white sm:text-7xl md:text-9xl"
            >
              САКУРА
            </motion.h1>

            <motion.p
              variants={HERO_ITEM_VARIANTS}
              className="mt-2 max-w-lg px-4 text-base text-white/90 sm:text-lg md:mt-1 md:text-xl"
            >
              Крупнейшая сеть саун в Набережных Челнах
            </motion.p>

            <motion.div
              variants={HERO_ITEM_VARIANTS}
              className="mt-8 flex w-full max-w-xs flex-col gap-3 sm:max-w-none sm:flex-row sm:gap-5 md:mt-10"
            >
              {/* Primary — Dark forest */}
              <Link
                href="/complex-9"
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-emerald-800 via-green-900 to-emerald-950 px-8 py-4 text-base font-semibold text-white shadow-[0_8px_30px_rgba(6,78,59,0.55)] ring-1 ring-white/20 transition-shadow duration-300 hover:shadow-[0_12px_40px_rgba(6,78,59,0.75)] sm:px-10 sm:py-5"
              >
                {/* Shine sweep on hover */}
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <span className="relative">Сауна 9 комплекс</span>
              </Link>

              {/* Secondary — Dark wood brown */}
              <Link
                href="/complex-50"
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-amber-900 via-stone-800 to-amber-950 px-8 py-4 text-base font-semibold text-white shadow-[0_8px_30px_rgba(68,40,20,0.6)] ring-1 ring-white/20 transition-shadow duration-300 hover:shadow-[0_12px_40px_rgba(68,40,20,0.8)] sm:px-10 sm:py-5"
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <span className="relative">Сауна 50 комплекс</span>
              </Link>
            </motion.div>
          </motion.div>

          {/* Quick booking widget — sibling, не наследует scale заголовка.
              Анимация живёт ВНУТРИ <form> (motion.form), чтобы opacity и
              backdrop-filter были на одном элементе — иначе Chromium не
              рендерит блюр пока opacity предка < 1. */}
          <div className="relative z-10 mx-auto mt-8 w-full max-w-5xl sm:mt-12 md:mt-14">
            <HeroQuickBooking />
          </div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 md:block"
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          >
            <ChevronDown className="h-8 w-8 text-white/60" />
          </motion.div>
        </section>

        {/* ===== ABOUT ===== */}
        <section id="about" className="overflow-hidden py-20">
          <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16">
            <div className="grid grid-cols-1 items-center gap-28 md:grid-cols-2 md:gap-36">
              {/* Left — text */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="font-heading text-4xl text-foreground md:text-5xl">
                  О Сакуре
                </h2>
                <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                  «Сакура» — крупнейшая сеть саун в Набережных Челнах. Мы
                  предлагаем русские бани, финские сауны и турецкие хамамы для
                  любого формата отдыха: от камерного семейного вечера до
                  большой дружеской компании. Комфортные бассейны, уютные
                  комнаты отдыха и внимательный сервис — все, что нужно для
                  полного расслабления.
                </p>
              </motion.div>

              {/* Right — single-slide carousel */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                <Carousel>
                  <CarouselContent>
                    {carouselSlides.map((slide, i) => (
                      <CarouselItem key={slide.title} className="basis-full">
                        <button
                          type="button"
                          onClick={() => setLightboxIndex(i)}
                          className="group relative block aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-2xl bg-muted shadow-lg"
                        >
                          <Image
                            src={slide.image}
                            alt={slide.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                        </button>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselNavigation
                    alwaysShow
                    className="-left-16 w-[calc(100%+8rem)] md:-left-20 md:w-[calc(100%+10rem)]"
                    classNameButton="bg-forest/90 backdrop-blur *:stroke-white dark:bg-forest/90 dark:*:stroke-white shadow-lg"
                  />
                  <CarouselIndicator className="mt-4 relative" />
                </Carousel>
              </motion.div>
            </div>
          </div>

          <Lightbox
            images={carouselSlides.map((s) => s.image)}
            openIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onChangeIndex={setLightboxIndex}
            alt="Сакура"
          />
        </section>

        {/* ===== PROMOTIONS ===== */}
        <section id="promotions" className="overflow-hidden py-28">
          <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="font-heading text-5xl text-foreground md:text-6xl mb-4"
            >
              Акции
            </motion.h2>
            <p className="text-lg text-muted-foreground mb-14">Специальные предложения для наших гостей</p>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {promotions.map((promo, idx) => (
                <motion.div
                  key={promo.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{
                    y: -4,
                    transition: { duration: 0.2, ease: "easeOut" },
                  }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.5,
                    delay: idx * 0.1,
                    ease: "easeOut",
                  }}
                  className="rounded-2xl border bg-card p-8 shadow-md transition-shadow duration-200 hover:shadow-lg"
                >
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-forest/10">
                    {promoIcons[promo.icon] ?? (
                      <Flame className="h-7 w-7 text-forest" />
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">
                    {promo.title}
                  </h3>
                  <p className="mt-3 text-base text-foreground/80">
                    {promo.description}
                  </p>
                  <p className="mt-4 text-sm text-muted-foreground">
                    {promo.note}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== CONTACTS ===== */}
        <section id="contacts" className="overflow-hidden py-20">
          <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="font-heading text-4xl text-foreground md:text-5xl"
            >
              Контакты
            </motion.h2>

            <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2">
              {/* Left: Contact cards — stretch to match map height */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6 }}
                className="flex flex-col justify-between gap-6"
              >
                <a
                  href={yandexLinks.complex9}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 rounded-xl border bg-card p-6 shadow-sm flex flex-col justify-center transition-colors hover:border-forest/50"
                >
                  <h3 className="text-xl font-semibold text-foreground">
                    Сауна 9 комплекс
                  </h3>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-3 text-sm text-foreground/80">
                      <MapPin className="h-5 w-5 shrink-0 text-forest" />
                      <span>пр. Мира, д. 9/04А</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-foreground/80">
                      <Phone className="h-5 w-5 shrink-0 text-forest" />
                      <span>+7 (927) 465-1000</span>
                    </div>
                  </div>
                  <span className="mt-4 text-xs text-forest">Открыть на карте →</span>
                </a>

                <a
                  href={yandexLinks.complex50}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 rounded-xl border bg-card p-6 shadow-sm flex flex-col justify-center transition-colors hover:border-forest/50"
                >
                  <h3 className="text-xl font-semibold text-foreground">
                    Сауна 50 комплекс
                  </h3>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-3 text-sm text-foreground/80">
                      <MapPin className="h-5 w-5 shrink-0 text-forest" />
                      <span>ул. Нижняя Боровецкая, 20</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-foreground/80">
                      <Phone className="h-5 w-5 shrink-0 text-forest" />
                      <span>+7 (8552) 784 000</span>
                    </div>
                  </div>
                  <span className="mt-4 text-xs text-forest">Открыть на карте →</span>
                </a>
              </motion.div>

              {/* Right: Yandex Map */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6 }}
                className="relative overflow-hidden rounded-xl border shadow-sm"
              >
                <iframe
                  title="Карта расположения саун Сакура"
                  src={mapSrc}
                  className="h-full min-h-[400px] w-full"
                  allowFullScreen
                  loading="lazy"
                />
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
