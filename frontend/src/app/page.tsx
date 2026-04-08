"use client";

import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNavigation,
  CarouselIndicator,
} from "@/components/ui/carousel";
import { promotions } from "@/lib/saunas";
import { Flame, Gift, Cake, ChevronDown, Phone, MapPin } from "lucide-react";
import { motion } from "framer-motion";

const promoIcons: Record<string, React.ReactNode> = {
  flame: <Flame className="h-8 w-8 text-forest" />,
  gift: <Gift className="h-8 w-8 text-forest" />,
  cake: <Cake className="h-8 w-8 text-forest" />,
};

const carouselSlides = [
  { title: "Русская баня", gradient: "from-wood-dark to-wood" },
  { title: "Финская сауна", gradient: "from-forest-dark to-forest" },
  { title: "Турецкий хамам", gradient: "from-wood to-forest-dark" },
  { title: "Бассейн", gradient: "from-forest to-wood-dark" },
  { title: "Комната отдыха", gradient: "from-wood-light to-wood-dark" },
  { title: "Шашлычная", gradient: "from-forest-light to-forest-dark" },
];

const mapSrc = "https://yandex.ru/map-widget/v1/?ll=52.406%2C55.750&z=12&pt=52.389442,55.726188,pm2gnm1~52.422554,55.773935,pm2gnm2";

const yandexLinks = {
  complex9: "https://yandex.ru/maps/?pt=52.389442,55.726188&z=16&l=map",
  complex50: "https://yandex.ru/maps/?pt=52.422554,55.773935&z=16&l=map",
};

export default function HomePage() {

  return (
    <>
      <Header />
      <main>
        {/* ===== HERO ===== */}
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-[#3d2b1f] to-[#1a3a2a]">
          {/* Grid pattern overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative z-10 flex flex-col items-center px-4 text-center"
          >
            <h1 className="font-heading text-7xl tracking-wider text-white md:text-9xl">
              САКУРА
            </h1>

            <p className="mt-4 max-w-lg text-lg text-white/80 md:text-xl">
              Крупнейшая сеть саун в Набережных Челнах
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/complex-9"
                className="rounded-full bg-forest px-8 py-4 text-base font-medium text-white transition-colors hover:bg-forest-dark"
              >
                Сауна 9 комплекс
              </Link>
              <Link
                href="/complex-50"
                className="rounded-full border border-white/20 bg-white/5 px-8 py-4 text-base font-medium text-white transition-colors hover:bg-white/15"
              >
                Сауна 50 комплекс
              </Link>
            </div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          >
            <ChevronDown className="h-8 w-8 text-white/60" />
          </motion.div>
        </section>

        {/* ===== ABOUT ===== */}
        <section id="about" className="py-20">
          <div className="mx-auto max-w-6xl px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-heading text-4xl text-foreground md:text-5xl">
                О Сакуре
              </h2>
              <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted-foreground">
                «Сакура» — крупнейшая сеть саун в Набережных Челнах. Мы
                предлагаем русские бани, финские сауны и турецкие хамамы для
                любого формата отдыха: от камерного семейного вечера до большой
                дружеской компании. Комфортные бассейны, уютные комнаты отдыха и
                внимательный сервис — все, что нужно для полного расслабления.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative mt-12"
            >
              <Carousel>
                <CarouselContent className="gap-4">
                  {carouselSlides.map((slide) => (
                    <CarouselItem
                      key={slide.title}
                      className="basis-full px-1 sm:basis-[45%] lg:basis-[40%]"
                    >
                      <div
                        className={`flex aspect-[4/3] items-end rounded-xl bg-gradient-to-br ${slide.gradient} p-6`}
                      >
                        <span className="text-xl font-semibold text-white drop-shadow-md">
                          {slide.title}
                        </span>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselNavigation
                  alwaysShow
                  classNameButton="bg-forest *:stroke-white dark:bg-forest dark:*:stroke-white"
                />
                <CarouselIndicator className="mt-4 relative" />
              </Carousel>
            </motion.div>
          </div>
        </section>

        {/* ===== PROMOTIONS ===== */}
        <section id="promotions" className="py-28">
          <div className="mx-auto max-w-6xl px-4">
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
                  whileHover={{ scale: 1.04, transition: { duration: 0.2 } }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="rounded-2xl border bg-card p-8 shadow-md cursor-pointer transition-shadow hover:shadow-lg"
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
        <section id="contacts" className="py-20">
          <div className="mx-auto max-w-6xl px-4">
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
                  className="h-full min-h-[400px] w-full brightness-[0.85] contrast-[1.1] saturate-[0.7] hue-rotate-[15deg]"
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
