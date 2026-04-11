"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, Phone, Flame, Droplets, Bath } from "lucide-react";

interface ComplexHeroProps {
  name: string;
  address: string;
  /** Готовая ссылка на карту, иначе подставляется поиск по адресу. */
  addressMapUrl?: string;
  phone: string;
  /** Короткий маркетинговый текст под заголовком. */
  description?: string;
  saunaCount: number;
  poolCount: number;
  typeCount: number;
  /** До 3-х фото для коллажа справа. Первое — большое (приоритет загрузки). */
  images: [string, string, string] | [string];
  /** Якорь для CTA «Посмотреть сауны». Если не задан — кнопка не рендерится. */
  scrollToId?: string;
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: "easeOut" as const },
  },
};

export function ComplexHero({
  name,
  address,
  addressMapUrl,
  phone,
  description = "Премиальные сауны в Набережных Челнах: парные, бассейны и комнаты отдыха для компаний и семей.",
  saunaCount,
  poolCount,
  typeCount,
  images,
  scrollToId,
}: ComplexHeroProps) {
  const phoneClean = phone.replace(/[\s()-]/g, "");
  const mapUrl =
    addressMapUrl ??
    `https://yandex.ru/maps/?text=${encodeURIComponent(address)}`;
  const hasCollage = images.length === 3;

  return (
    <section className="relative overflow-hidden border-b border-border bg-background">
      {/* Decorative gradient blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 -top-32 h-[32rem] w-[32rem] rounded-full bg-forest/20 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-wood/15 blur-[120px]"
      />

<div className="container relative z-10 mx-auto grid grid-cols-1 gap-12 px-4 py-20 sm:py-24 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-16 lg:py-28">
        {/* ---------- Left: content ---------- */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.12, delayChildren: 0.05 },
            },
          }}
        >
          <motion.span
            variants={itemVariants}
            className="inline-flex items-center gap-2 rounded-full border border-forest/30 bg-forest/10 px-3.5 py-1.5 text-xs font-medium uppercase tracking-wider text-forest"
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-forest" />
            Сеть саун Сакура
          </motion.span>

          <motion.h1
            variants={itemVariants}
            className="mt-6 font-heading text-5xl leading-[0.95] tracking-tight text-foreground sm:text-6xl lg:text-7xl"
          >
            {name}
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            {description}
          </motion.p>

          {/* Stats row */}
          <motion.div
            variants={itemVariants}
            className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-foreground/90"
          >
            <span className="inline-flex items-center gap-2">
              <Bath className="h-4 w-4 text-forest" />
              <span>
                <strong className="font-semibold text-foreground">
                  {saunaCount}
                </strong>{" "}
                {pluralize(saunaCount, ["сауна", "сауны", "саун"])}
              </span>
            </span>
            <span className="hidden h-4 w-px bg-border sm:inline-block" />
            <span className="inline-flex items-center gap-2">
              <Droplets className="h-4 w-4 text-forest" />
              <span>
                <strong className="font-semibold text-foreground">
                  {poolCount}
                </strong>{" "}
                с бассейн{poolCount === 1 ? "ом" : "ами"}
              </span>
            </span>
            <span className="hidden h-4 w-px bg-border sm:inline-block" />
            <span className="inline-flex items-center gap-2">
              <Flame className="h-4 w-4 text-forest" />
              <span>
                <strong className="font-semibold text-foreground">
                  {typeCount}
                </strong>{" "}
                {pluralize(typeCount, [
                  "тип парных",
                  "типа парных",
                  "типов парных",
                ])}
              </span>
            </span>
          </motion.div>

          {/* Address & phone with icon-pills */}
          <motion.div variants={itemVariants} className="mt-8 space-y-3">
            <a
              href={mapUrl}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-3 text-base text-foreground/90 hover:text-foreground"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card transition-colors group-hover:border-forest/50">
                <MapPin className="h-4 w-4 text-forest" />
              </span>
              <span className="border-b border-transparent transition-colors group-hover:border-foreground/40">
                {address}
              </span>
            </a>
            <a
              href={`tel:${phoneClean}`}
              className="group flex items-center gap-3 text-base text-foreground/90 hover:text-foreground"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card transition-colors group-hover:border-forest/50">
                <Phone className="h-4 w-4 text-forest" />
              </span>
              <span className="border-b border-transparent transition-colors group-hover:border-foreground/40">
                {phone}
              </span>
            </a>
          </motion.div>

          {/* CTAs */}
          <motion.div
            variants={itemVariants}
            className="mt-10 flex flex-wrap gap-4"
          >
            <a
              href={`tel:${phoneClean}`}
              className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-emerald-700 via-emerald-800 to-emerald-900 px-8 py-4 text-base font-semibold text-white shadow-[0_8px_30px_rgba(6,78,59,0.4)] ring-1 ring-emerald-500/30 transition-shadow duration-200 hover:shadow-[0_12px_40px_rgba(6,78,59,0.55)]"
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <Phone className="h-4 w-4" />
              Забронировать
            </a>
            {scrollToId && (
              <a
                href={`#${scrollToId}`}
                className="inline-flex items-center justify-center rounded-full border border-border bg-card px-8 py-4 text-base font-semibold text-foreground transition-colors hover:border-forest/50 hover:text-forest"
              >
                Посмотреть сауны
              </a>
            )}
          </motion.div>
        </motion.div>

        {/* ---------- Right: photo ---------- */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.45, ease: "easeOut" }}
          className="relative"
        >
          {/* Subtle gradient frame glow behind */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-tr from-forest/15 via-transparent to-wood/15 blur-3xl"
          />

          {hasCollage ? (
            // Плоская сетка 2×2: большое фото слева через row-span-2, два справа.
            // Используем нативный <img> вместо next/image — в dev-режиме у Next 16
            // оптимизатор странно молчит про второе и третье priority-фото в одном
            // grid-контейнере (тройку выше first-of-type не догоняет). Файлы webp
            // у нас уже легковесные (70-260 KB), оптимизация в hero не критична.
            <div className="grid h-[26rem] grid-cols-2 grid-rows-2 gap-3 sm:h-[32rem] lg:h-[34rem]">
              {/* Big image: left column, both rows */}
              <div className="relative row-span-2 overflow-hidden rounded-3xl border border-border shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={images[0]}
                  alt={`${name} — фото 1`}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="eager"
                  decoding="async"
                />
              </div>
              {/* Top right */}
              <div className="relative overflow-hidden rounded-3xl border border-border shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={images[1]}
                  alt={`${name} — фото 2`}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="eager"
                  decoding="async"
                />
              </div>
              {/* Bottom right */}
              <div className="relative overflow-hidden rounded-3xl border border-border shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={images[2]}
                  alt={`${name} — фото 3`}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="eager"
                  decoding="async"
                />
              </div>
            </div>
          ) : (
            <div className="relative h-[26rem] overflow-hidden rounded-3xl border border-border shadow-2xl sm:h-[32rem] lg:h-[34rem]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[0]}
                alt={`${name} — фото`}
                className="absolute inset-0 h-full w-full object-cover"
                loading="eager"
                decoding="async"
              />
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

/** Простая русская плюрализация: [1, 2..4, 5..0] */
function pluralize(n: number, forms: [string, string, string]) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];
  return forms[2];
}
