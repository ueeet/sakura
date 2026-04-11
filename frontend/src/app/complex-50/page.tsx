"use client";

import Image from "next/image";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ComplexHero } from "@/components/ComplexHero";
import { complex50 } from "@/lib/saunas";
import { motion } from "framer-motion";
import Link from "next/link";

const badgeColors: Record<string, string> = {
  finnish: "bg-wood-dark/80 text-white",
  russian: "bg-wood-dark/80 text-white",
  hamam: "bg-wood-dark/80 text-white",
};

export default function Complex50Page() {
  const saunas = complex50.saunas ?? [];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <ComplexHero
          name={complex50.name}
          address={complex50.address}
          addressMapUrl="https://yandex.ru/maps/?pt=52.422554,55.773935&z=16&l=map"
          phone={complex50.phone}
          description="50-й комплекс — финские и русские сауны с бассейнами, шашлычным двором и мангалом. Идеально для компаний."
          saunaCount={saunas.length}
          poolCount={saunas.filter((s) => s.pool).length}
          typeCount={new Set(saunas.map((s) => s.type)).size}
          images={[
            "/images/saunas/complex-50/1/1.webp",
            "/images/saunas/complex-50/2/1.webp",
            "/images/saunas/complex-50/3/1.webp",
          ]}
          scrollToId="saunas"
        />

        {/* Sauna Cards Grid */}
        <section
          id="saunas"
          className="container mx-auto px-4 py-10 sm:py-14"
        >
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {saunas.map((sauna, index) => (
              <motion.div
                key={sauna.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
              >
                <Link
                  href={`/complex-50/${sauna.id}`}
                  className="group block h-full"
                >
                  <div className="flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                    {/* Image */}
                    <div className="relative aspect-[3/2] overflow-hidden bg-muted">
                      <Image
                        src={sauna.image}
                        alt={sauna.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className={`absolute left-3 top-3 z-10 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeColors[sauna.type] ?? "bg-muted text-muted-foreground"}`}>
                        {sauna.typeLabel}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="text-lg font-semibold">{sauna.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{sauna.sizeLabel}</p>
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground/80">{sauna.description}</p>
                      <div className="mt-auto pt-4">
                        <span className="inline-flex items-center rounded-full bg-forest/10 px-4 py-1.5 text-sm font-medium text-forest transition-colors group-hover:bg-forest group-hover:text-white">
                          Подробнее
                          <svg className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Extras Note */}
          <p className="text-center text-muted-foreground mt-10 text-sm">
            Мангал и шашлычный двор доступны за дополнительную плату
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
