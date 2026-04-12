"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
import { Flame, Gift, Cake, ChevronDown, ChevronLeft, ChevronRight, Phone, MapPin, Star, Quote, Send, CheckCircle2, X, Upload, Loader2 } from "lucide-react";
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
        {/* ===== REVIEWS ===== */}
        <ReviewsSection reviews={reviews} />
      </main>
      <Footer />
    </>
  );
}

/* ───────── Reviews Section ───────── */

// Photo reviews are loaded from the database (reviews with image != null)

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

function pluralReviews(n: number) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "отзыв";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "отзыва";
  return "отзывов";
}

function ReviewsSection({ reviews }: { reviews: Review[] }) {
  const [formOpen, setFormOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [showTextReviews, setShowTextReviews] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);

  const photoReviews = reviews.filter((r) => !!r.image);
  const textReviews = reviews.filter((r) => !r.image);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    return () => el.removeEventListener("scroll", checkScroll);
  }, [checkScroll]);

  function scroll(dir: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-review-card]");
    const step = card ? card.offsetWidth + 24 : 360;
    el.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" });
  }

  const avg = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  async function handlePhotoUpload(file: File) {
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${API_URL}/upload/review-photo`, { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPhotoUrl(data.url);
    } catch {
      setError("Не удалось загрузить фото");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (name.trim().length < 2) { setError("Введите ваше имя"); return; }
    if (text.trim().length < 10) { setError("Отзыв слишком короткий (минимум 10 символов)"); return; }

    setSending(true);
    try {
      const payload: Record<string, unknown> = { authorName: name.trim(), text: text.trim(), rating };
      if (photoUrl) payload.image = photoUrl;
      const res = await fetch(`${API_URL}/reviews/public`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
      setName("");
      setText("");
      setRating(5);
      setPhotoUrl("");
    } catch {
      setError("Не удалось отправить отзыв. Попробуйте позже.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section id="reviews" className="overflow-hidden py-24">
      <div className="mx-auto max-w-[1536px] px-6 md:px-12 lg:px-16">
        {/* Header row */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between mb-6">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="font-heading text-5xl tracking-tight text-foreground md:text-7xl mb-4"
            >
              Отзывы
            </motion.h2>
            <p className="text-lg text-muted-foreground md:text-xl">
              Что говорят наши гости
            </p>
          </div>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            onClick={() => { setFormOpen(true); setSubmitted(false); setError(""); }}
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-forest px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-forest-dark"
          >
            <Send className="h-4 w-4" />
            Оставить отзыв
          </motion.button>
        </div>

        {/* Average rating + arrow controls */}
        <div className="flex items-center justify-between mb-8">
          {reviews.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-4"
            >
              <span className="text-4xl font-bold text-foreground sm:text-5xl">
                {avg.toFixed(1)}
              </span>
              <div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.round(avg) ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {reviews.length} {pluralReviews(reviews.length)}
                </p>
              </div>
            </motion.div>
          )}

          {/* Arrows */}
          <div className="flex gap-2">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted disabled:opacity-30 disabled:cursor-default"
              aria-label="Назад"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted disabled:opacity-30 disabled:cursor-default"
              aria-label="Вперёд"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Photo review cards — horizontal scroll */}
      {photoReviews.length > 0 && (
      <div className="mx-auto max-w-[1536px] px-6 md:px-12 lg:px-16">
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scroll-smooth pb-4 scrollbar-hide"
        style={{ scrollbarWidth: "none" }}
      >
        {photoReviews.map((review, idx) => (
          <motion.div
            key={review.id}
            data-review-card
            style={{ willChange: "transform, opacity" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: Math.min(idx, 4) * 0.08, ease: "easeOut" }}
            className="w-[300px] shrink-0 sm:w-[340px] lg:w-[380px]"
          >
            <div className="rounded-2xl border bg-card shadow-md overflow-hidden">
              <div className="relative aspect-square overflow-hidden bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={review.image!}
                  alt={review.authorName}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-5">
                <div className="mb-3">
                  <p className="font-semibold text-foreground text-sm">{review.authorName}</p>
                  <div className="flex gap-0.5 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < review.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {review.text}
                </p>
                {review.source !== "site" && (
                  <span className="mt-3 inline-block text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider">
                    {review.source === "2gis" ? "2ГИС" : "Яндекс"}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      </div>
      )}

      {/* "More reviews" — text-only reviews hidden by default */}
      {textReviews.length > 0 && (
        <div className="mx-auto max-w-[1536px] px-6 md:px-12 lg:px-16 mt-12">
          <div className="text-center">
            <button
              onClick={() => setShowTextReviews((v) => !v)}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              {showTextReviews ? "Скрыть отзывы" : `Ещё ${textReviews.length} ${pluralReviews(textReviews.length)}`}
            </button>
          </div>

          <AnimatePresence>
            {showTextReviews && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 gap-6 pt-10 md:grid-cols-2 lg:grid-cols-3">
                  {textReviews.map((review, idx) => (
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
                        delay: Math.min(idx, 5) * 0.08,
                        ease: "easeOut",
                      }}
                      className="relative rounded-2xl border bg-card p-6 shadow-md transition-shadow duration-200 hover:shadow-lg"
                    >
                      <Quote className="absolute top-5 right-5 h-8 w-8 text-forest/10" />
                      <div className="mb-4">
                        <p className="font-semibold text-foreground text-sm">
                          {review.authorName}
                        </p>
                        <div className="flex gap-0.5 mt-1">
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
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                        {review.text}
                      </p>
                      {review.source !== "site" && (
                        <div className="mt-4">
                          <span className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider">
                            {review.source === "2gis" ? "2ГИС" : "Яндекс"}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── Review form modal ── */}
      <AnimatePresence>
        {formOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onMouseDown={(e) => {
              // Запоминаем, началось ли нажатие на бэкдропе, а не внутри модалки.
              // Так drag от текста в инпуте, отпущенный за пределами, не закроет
              // окно — классический UX-паттерн «click-outside».
              (e.currentTarget as HTMLElement & { _backdropDown?: boolean })._backdropDown =
                e.target === e.currentTarget;
            }}
            onMouseUp={(e) => {
              const el = e.currentTarget as HTMLElement & { _backdropDown?: boolean };
              if (el._backdropDown && e.target === e.currentTarget) {
                setFormOpen(false);
              }
              el._backdropDown = false;
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              style={{ willChange: "transform, opacity" }}
              className="w-full max-w-lg rounded-2xl border bg-card p-6 shadow-2xl sm:p-8"
            >
              {submitted ? (
                <div className="flex flex-col items-center text-center py-6">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15">
                    <CheckCircle2 className="h-7 w-7 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Спасибо за отзыв!</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Он появится на сайте после модерации.
                  </p>
                  <button
                    onClick={() => setFormOpen(false)}
                    className="mt-6 rounded-xl bg-forest px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-forest-dark"
                  >
                    Закрыть
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-foreground">Оставить отзыв</h3>
                    <button
                      onClick={() => setFormOpen(false)}
                      className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">
                        Ваше имя
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Иван"
                        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:border-forest"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">
                        Оценка
                      </label>
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setRating(i + 1)}
                            onMouseEnter={() => setHoverRating(i + 1)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-0.5 transition-transform hover:scale-110"
                          >
                            <Star
                              className={`h-7 w-7 ${
                                i < (hoverRating || rating)
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-muted-foreground/30"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">
                        Ваш отзыв
                      </label>
                      <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows={4}
                        placeholder="Расскажите о вашем опыте..."
                        className="w-full resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:border-forest"
                      />
                    </div>
                    {/* Photo upload */}
                    <div>
                      {photoUrl ? (
                        <div className="relative rounded-xl overflow-hidden border border-border">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={photoUrl} alt="Превью" className="w-full aspect-[4/3] object-cover" />
                          <button
                            type="button"
                            onClick={() => setPhotoUrl("")}
                            className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => photoRef.current?.click()}
                          disabled={uploading}
                          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-4 text-sm text-muted-foreground transition-colors hover:border-forest/50 hover:text-foreground"
                        >
                          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                          {uploading ? "Загрузка..." : "Добавить фото (опционально)"}
                        </button>
                      )}
                      <input
                        ref={photoRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handlePhotoUpload(f);
                          e.target.value = "";
                        }}
                      />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <button
                      type="submit"
                      disabled={sending || uploading}
                      className="w-full rounded-xl bg-forest px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-forest-dark disabled:opacity-50"
                    >
                      {sending ? "Отправка..." : "Отправить отзыв"}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
