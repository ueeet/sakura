"use client";

import { useState, useEffect, useCallback } from "react";
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
import type { Promotion, HomeSlide, Review } from "@/lib/types";
import { Flame, Gift, Cake, ChevronDown, Phone, MapPin, Star, Quote, Send, CheckCircle2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const promoIcons: Record<string, React.ReactNode> = {
  flame: <Flame className="h-8 w-8 text-forest" />,
  gift: <Gift className="h-8 w-8 text-forest" />,
  cake: <Cake className="h-8 w-8 text-forest" />,
};

// Фолбэк на случай, если админка опустошила список слайдов —
// карусель «О Сакуре» всё равно должна что-то показывать, иначе будет
// пустой aspect-[4/3] контейнер = явный визуальный баг.
const FALLBACK_SLIDES: HomeSlide[] = [
  { image: "/images/saunas/complex-9/family/2/1.webp" },
  { image: "/images/saunas/complex-9/family/1/1.webp" },
  { image: "/images/saunas/complex-9/family/4/1.webp" },
  { image: "/images/saunas/complex-9/regular/1/1.webp" },
  { image: "/images/saunas/complex-9/family/3/2.webp" },
  { image: "/images/saunas/complex-50/1/1.webp" },
];

const HERO_PHRASES = [
  "Крупнейшая сеть саун в Набережных Челнах",
  "Онлайн-бронирование 24/7",
  "Русские бани · Финские сауны · Хамамы",
];

const mapSrc = "https://yandex.ru/map-widget/v1/?ll=52.406%2C55.750&z=12&pt=52.389442,55.726188,pm2gnm1~52.422554,55.773935,pm2gnm2";

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

export function HomeView({
  promotions,
  slides,
  reviews,
}: {
  promotions: Promotion[];
  slides: HomeSlide[];
  reviews: Review[];
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const carouselSlides = slides.length > 0 ? slides : FALLBACK_SLIDES;

  const [phraseIdx, setPhraseIdx] = useState(0);
  const nextPhrase = useCallback(() => {
    setPhraseIdx((i) => (i + 1) % HERO_PHRASES.length);
  }, []);
  useEffect(() => {
    const id = setInterval(nextPhrase, 3500);
    return () => clearInterval(id);
  }, [nextPhrase]);

  return (
    <>
      <Header />
      <main>
        {/* ===== HERO =====
            overflow-x-clip (не overflow-hidden!) — клипаем только по X, чтобы
            декоративная тень-подложка под заголовком (h-[180%] w-[180%]) не
            вылезала горизонтально на мобиле (180% от ~250px > 375px viewport).
            По Y оставляем overflow: visible, иначе попапы календаря/гостей
            HeroQuickBooking обрезаются границей секции, когда открываются
            вниз (visible-bug см. скрин от пользователя). */}
        <section className="relative flex min-h-screen flex-col items-center justify-center overflow-x-clip bg-black px-4 pb-[126px] pt-5 sm:pb-[142px] md:pb-[158px] md:pt-9">
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
          <div className="pointer-events-none absolute inset-0 bg-black/65" />

          {/* Vignette — тёмные края, прозрачный центр */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 90% 75% at 50% 50%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.45) 75%, rgba(0,0,0,0.85) 100%)",
            }}
          />

          {/* Hero stagger: каждый ребёнок (h1 → p) выезжает с задержкой 0.18s
              через staggerChildren. Плашка HeroQuickBooking и строка вторичных
              ссылок лежат сиблингами ниже, им выставлены совпадающие delay'и
              вручную (0.46 и 0.85). */}
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
            <motion.h1
              variants={HERO_ITEM_VARIANTS}
              className="font-heading text-6xl tracking-tight text-white sm:text-7xl md:text-9xl"
            >
              САКУРА
            </motion.h1>

            <motion.div
              variants={HERO_ITEM_VARIANTS}
              className="relative mt-2 flex h-8 w-screen max-w-none items-center justify-center px-4 sm:h-9 md:mt-1 md:h-10"
            >
              <AnimatePresence mode="wait">
                <motion.p
                  key={phraseIdx}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="absolute whitespace-nowrap text-xl text-white/90 sm:text-2xl md:text-[27px]"
                >
                  {HERO_PHRASES[phraseIdx]}
                </motion.p>
              </AnimatePresence>
            </motion.div>
          </motion.div>

          {/* Quick booking widget — единственный primary CTA в hero.
              Сиблинг, не наследует scale заголовка.
              Анимация живёт ВНУТРИ <form> (motion.form), чтобы opacity и
              backdrop-filter были на одном элементе — иначе Chromium не
              рендерит блюр пока opacity предка < 1.
              Delay формы пересчитан после удаления группы больших кнопок:
              было 0.64 (= 0.1 + 0.18×3), стало 0.46 (= 0.1 + 0.18×2).

              z-20 (не z-10) — чтобы весь stacking context формы, включая
              выпадающие попапы календаря/гостей/филиала, рендерился над
              secondary-строкой ссылок ниже. Иначе попапы рисуются под
              «Посмотреть 9/50 комплекс», потому что secondary-строка идёт
              позже в DOM с тем же z-10 и перекрывает их. */}
          <div className="relative z-20 mx-auto mt-12 w-full max-w-5xl sm:mt-14 md:mt-16">
            <HeroQuickBooking />
          </div>

          {/* Secondary — тонкие текстовые ссылки на страницы комплексов.
              Сознательно приглушены (text-white/60, text-xs/sm, underline-only),
              чтобы не конкурировать с формой за внимание. Даём аффорданс
              «посмотреть страницу комплекса целиком» тем, кто хочет обзор
              перед бронированием. */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.85, ease: "easeOut" }}
            className="relative z-10 mt-6 flex items-center justify-center gap-4 text-xs text-white/60 sm:gap-5 sm:text-sm"
          >
            <Link
              href="/complex-9"
              className="underline decoration-white/30 underline-offset-4 transition-colors hover:text-white hover:decoration-white"
            >
              Посмотреть 9 комплекс →
            </Link>
            <span aria-hidden className="text-white/30">•</span>
            <Link
              href="/complex-50"
              className="underline decoration-white/30 underline-offset-4 transition-colors hover:text-white hover:decoration-white"
            >
              Посмотреть 50 комплекс →
            </Link>
          </motion.div>

          {/* Scroll indicator — всегда на всех экранах, прижат к низу ПЕРВОГО
              экрана (а не к низу всей секции). Секция `min-h-screen` и часто
              вырастает выше 100svh из-за формы бронирования + secondary-строки
              — тогда `bottom-N` уезжает ниже фолда и стрелка не видна.
              Формула: `top: calc(100svh - 64px - 24px)` =
              (высота вьюпорта) − (h-16 sticky header, он в потоке и съедает
              первые 64px фолда) − (24px отступ от нижней кромки). svh, не vh —
              чтобы на мобильных Safari/Chrome учитывалась уменьшённая высота
              с панелью адреса. */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[calc(100svh-113px)] -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          >
            <ChevronDown className="h-7 w-7 text-white/70 sm:h-8 sm:w-8" />
          </motion.div>
        </section>

        {/* ===== ABOUT ===== */}
        <section id="about" className="overflow-hidden py-24">
          <div className="mx-auto max-w-[1536px] px-6 md:px-12 lg:px-16">
            <div className="grid grid-cols-1 items-center gap-28 md:grid-cols-2 md:gap-36">
              {/* Left — text */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="font-heading text-5xl tracking-tight text-foreground md:text-7xl">
                  О Сакуре
                </h2>
                <p className="mt-6 text-lg leading-relaxed text-muted-foreground md:text-xl">
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
                      <CarouselItem key={slide.image} className="basis-full">
                        <button
                          type="button"
                          onClick={() => setLightboxIndex(i)}
                          className="group relative block aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-2xl bg-muted shadow-lg"
                        >
                          <Image
                            src={slide.image}
                            alt="Сакура"
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
        <section id="promotions" className="overflow-hidden py-24">
          <div className="mx-auto max-w-[1536px] px-6 md:px-12 lg:px-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="font-heading text-5xl tracking-tight text-foreground md:text-7xl mb-4"
            >
              Акции
            </motion.h2>
            <p className="text-lg text-muted-foreground mb-14 md:text-xl">Специальные предложения для наших гостей</p>

            {promotions.length === 0 ? (
              /* Empty state — если бэк вернул [] или упал.
                 Rule 5.8: NEVER blank, no dead ends. Объяснение + направление
                 + CTA. Телефон берём из 9 комплекса как основной публичный
                 номер (совпадает с карточкой контактов ниже по странице). */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="mx-auto max-w-xl rounded-2xl border bg-card p-10 text-center shadow-md"
              >
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-forest/10">
                  <Gift className="h-7 w-7 text-forest/70" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Сейчас активных акций нет
                </h3>
                <p className="mt-3 text-base text-muted-foreground">
                  Следите за обновлениями или позвоните — подскажем
                  персональное предложение под вашу компанию и дату.
                </p>
                <a
                  href="tel:+79274651000"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-forest px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-forest-dark"
                >
                  <Phone className="h-4 w-4" />
                  Позвонить
                </a>
              </motion.div>
            ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {promotions.map((promo, idx) => (
                <motion.div
                  key={promo.id}
                  style={{ willChange: "transform, opacity" }}
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
                  className={`rounded-2xl border bg-card shadow-md transition-shadow duration-200 hover:shadow-lg overflow-hidden ${promo.image ? "" : "p-8"}`}
                >
                  {promo.image ? (
                    <>
                      <div className="relative aspect-[16/10] overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={promo.image}
                          alt={promo.title}
                          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-6">
                        <p className="text-base text-muted-foreground">
                          {promo.description}
                        </p>
                        {promo.note && (
                          <p className="mt-2 text-sm text-muted-foreground">
                            {promo.note}
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-forest/10">
                        {(promo.icon && promoIcons[promo.icon]) ?? (
                          <Flame className="h-7 w-7 text-forest" />
                        )}
                      </div>
                      <h3 className="text-xl font-semibold text-foreground">
                        {promo.title}
                      </h3>
                      <p className="mt-3 text-base text-muted-foreground">
                        {promo.description}
                      </p>
                      {promo.note && (
                        <p className="mt-4 text-sm text-muted-foreground">
                          {promo.note}
                        </p>
                      )}
                    </>
                  )}
                </motion.div>
              ))}
            </div>
            )}
          </div>
        </section>

        {/* ===== REVIEWS ===== */}
        {reviews.length > 0 && (
          <section id="reviews" className="overflow-hidden py-24">
            <div className="mx-auto max-w-[1536px] px-6 md:px-12 lg:px-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6 }}
                className="font-heading text-5xl tracking-tight text-foreground md:text-7xl mb-4"
              >
                Отзывы
              </motion.h2>
              <p className="text-lg text-muted-foreground mb-14 md:text-xl">
                Что говорят наши гости
              </p>

              {/* Average rating */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5 }}
                className="mb-12 flex items-center gap-4"
              >
                <span className="text-5xl font-bold text-foreground">
                  {(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)}
                </span>
                <div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
                      return (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.round(avg) ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"
                          }`}
                        />
                      );
                    })}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {reviews.length} {reviews.length === 1 ? "отзыв" : reviews.length < 5 ? "отзыва" : "отзывов"}
                  </p>
                </div>
              </motion.div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {reviews.slice(0, 6).map((review, idx) => (
                  <motion.div
                    key={review.id}
                    style={{ willChange: "transform, opacity" }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    whileHover={{
                      y: -4,
                      transition: { duration: 0.2, ease: "easeOut" },
                    }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{
                      duration: 0.5,
                      delay: idx * 0.08,
                      ease: "easeOut",
                    }}
                    className="relative rounded-2xl border bg-card p-6 shadow-md transition-shadow duration-200 hover:shadow-lg"
                  >
                    <Quote className="absolute top-5 right-5 h-8 w-8 text-forest/10" />
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forest/10 text-forest font-semibold text-sm">
                        {review.authorName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">
                          {review.authorName}
                        </p>
                        <div className="flex gap-0.5 mt-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < review.rating
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-muted-foreground/30"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                      {review.text}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground/60">
                        {new Date(review.createdAt).toLocaleDateString("ru", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                      {review.source !== "site" && (
                        <span className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider">
                          {review.source === "2gis" ? "2ГИС" : "Яндекс"}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ===== CONTACTS ===== */}
        <section id="contacts" className="overflow-hidden py-24">
          <div className="mx-auto max-w-[1536px] px-6 md:px-12 lg:px-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="font-heading text-5xl tracking-tight text-foreground md:text-7xl"
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
                  href="tel:+79274651000"
                  className="group flex-1 rounded-2xl border bg-card p-6 shadow-sm flex flex-col justify-center transition-colors hover:border-forest/50"
                >
                  <h3 className="text-xl font-semibold text-foreground">
                    Сауна 9 комплекс
                  </h3>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <MapPin className="h-5 w-5 shrink-0 text-forest" />
                      <span>пр. Мира, д. 9/04А</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Phone className="h-5 w-5 shrink-0 text-forest" />
                      <span>+7 (927) 465-1000</span>
                    </div>
                  </div>
                  <span className="mt-5 inline-flex w-fit items-center rounded-xl bg-forest px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors group-hover:bg-forest-dark">
                    Позвонить
                  </span>
                </a>

                <a
                  href="tel:+78552784000"
                  className="group flex-1 rounded-2xl border bg-card p-6 shadow-sm flex flex-col justify-center transition-colors hover:border-forest/50"
                >
                  <h3 className="text-xl font-semibold text-foreground">
                    Сауна 50 комплекс
                  </h3>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <MapPin className="h-5 w-5 shrink-0 text-forest" />
                      <span>ул. Нижняя Боровецкая, 20</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Phone className="h-5 w-5 shrink-0 text-forest" />
                      <span>+7 (8552) 784 000</span>
                    </div>
                  </div>
                  <span className="mt-5 inline-flex w-fit items-center rounded-xl bg-forest px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors group-hover:bg-forest-dark">
                    Позвонить
                  </span>
                </a>
              </motion.div>

              {/* Right: Yandex Map */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6 }}
                className="relative overflow-hidden rounded-2xl border shadow-sm"
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
