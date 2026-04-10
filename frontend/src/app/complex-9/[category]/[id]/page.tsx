"use client";
import { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Phone, ArrowLeft, ChevronRight, Check } from "lucide-react";
import { BookingPicker } from "@/components/BookingPicker";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { complex9, type Sauna } from "@/lib/saunas";
import { ReviewFilterGroup, ReviewFilterItem } from "@/components/ui/review-filter-bars";
import { Lightbox } from "@/components/ui/lightbox";

export default function Complex9DetailPage(props: {
  params: Promise<{ category: string; id: string }>;
}) {
  const params = use(props.params);
  const { category, id } = params;
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const categoryData = complex9.categories?.find((c) => c.id === category);
  const sauna = categoryData?.saunas.find((s) => s.id === id);

  if (!sauna) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-semibold">Сауна не найдена</h1>
            <p className="text-muted-foreground">
              Запрашиваемая сауна не существует или была удалена.
            </p>
            <Link
              href="/complex-9"
              className="inline-flex items-center gap-2 text-forest hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Вернуться к списку
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Breadcrumb */}
        <div className="bg-muted/50 border-b">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex items-center gap-1 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">
                Главная
              </Link>
              <ChevronRight className="h-3 w-3" />
              <Link
                href="/complex-9"
                className="hover:text-foreground transition-colors"
              >
                9 Комплекс
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span className="hover:text-foreground transition-colors">
                {categoryData?.name}
              </span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground font-medium">{sauna.name}</span>
            </nav>
          </div>
        </div>

        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-forest/10 via-forest/5 to-transparent"
        >
          <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="inline-block rounded-full bg-forest/15 text-forest px-3 py-1 text-sm font-medium">
                {sauna.typeLabel}
              </span>
              <span className="inline-block rounded-full bg-wood/15 text-wood-dark px-3 py-1 text-sm font-medium">
                {sauna.sizeLabel}
              </span>
            </div>
            <h1 className="font-heading text-4xl md:text-5xl text-foreground">
              {sauna.name}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {complex9.name} &middot; {categoryData?.name}
            </p>
          </div>
        </motion.section>

        {/* Photo Gallery — 2x2 grid */}
        <section className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 gap-4">
            {sauna.images.map((src, i) => (
              <motion.button
                type="button"
                key={src}
                onClick={() => setLightboxIndex(i)}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="group relative aspect-[16/10] cursor-zoom-in overflow-hidden rounded-2xl bg-muted"
              >
                <Image
                  src={src}
                  alt={`${sauna.name} — фото ${i + 1}`}
                  fill
                  sizes="(max-width: 768px) 50vw, 40vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority={i === 0}
                />
                <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
              </motion.button>
            ))}
          </div>
        </section>

        <Lightbox
          images={sauna.images}
          openIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onChangeIndex={setLightboxIndex}
          alt={sauna.name}
        />

        {/* Content */}
        <section className="container mx-auto px-4 py-10 md:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Left column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-2 space-y-10"
            >
              {/* Description */}
              <div>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {sauna.description}
                </p>
              </div>

              {/* Amenities */}
              <div>
                <h2 className="text-2xl font-semibold mb-5">Удобства</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {sauna.amenities.map((amenity) => (
                    <div
                      key={amenity}
                      className="flex items-center gap-3 rounded-lg bg-muted/50 px-4 py-3"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600/20 ring-1 ring-emerald-500/40">
                        <Check className="h-4 w-4 text-emerald-400" strokeWidth={3} />
                      </span>
                      <span className="text-sm">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Extras */}
              {sauna.extras.length > 0 && (
                <div>
                  <h2 className="text-2xl font-semibold mb-5">
                    Дополнительные услуги
                  </h2>
                  <ul className="space-y-3">
                    {sauna.extras.map((extra) => (
                      <li key={extra} className="flex items-center gap-3">
                        <Plus className="h-4 w-4 shrink-0 text-wood" />
                        <span>{extra}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>

            {/* Right column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="space-y-5 sticky top-24">
                {/* Бронирование — основной блок */}
                <div className="rounded-2xl border-2 border-forest bg-gradient-to-b from-forest/15 to-card p-6 space-y-5">
                  <h3 className="text-2xl font-semibold text-center">Забронировать</h3>

                  <BookingPicker />

                  <a
                    href={`tel:${complex9.phone.replace(/[\s()-]/g, "")}`}
                    className="block w-full text-center rounded-lg bg-forest text-white py-3.5 px-4 text-base font-semibold hover:bg-forest-dark transition-colors"
                  >
                    Забронировать
                  </a>

                  <div className="flex items-center justify-center gap-3 pt-2">
                    <Phone className="h-4 w-4 text-forest" />
                    <a
                      href={`tel:${complex9.phone.replace(/[\s()-]/g, "")}`}
                      className="text-forest font-medium hover:underline"
                    >
                      {complex9.phone}
                    </a>
                  </div>
                </div>

                {/* Инфо */}
                <div className="rounded-xl border bg-card p-5 space-y-3">
                  {sauna.pool && (
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Бассейн:</span> {sauna.pool}
                    </div>
                  )}
                  <a
                    href={`tel:${complex9.phone.replace(/[\s()-]/g, "")}`}
                    className="block w-full text-center rounded-lg border border-border py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    Уточнить цены
                  </a>
                  <p className="text-xs text-muted-foreground text-center">{complex9.address}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Back button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12 pt-8 border-t"
          >
            <Link
              href="/complex-9"
              className="inline-flex items-center gap-2 text-forest hover:underline font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              Назад к списку
            </Link>
          </motion.div>
        </section>
      </main>
      <Footer />
    </>
  );
}
