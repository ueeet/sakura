"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
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
        {/* Hero Banner */}
        <section className="border-b border-border py-14 sm:py-18">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading text-foreground mb-3">
              Сауна 50 комплекс
            </h1>
            <p className="text-muted-foreground text-lg mb-1">
              {complex50.address}
            </p>
            <p className="text-muted-foreground text-lg">
              {complex50.phone}
            </p>
          </div>
        </section>

        {/* Sauna Cards Grid */}
        <section className="container mx-auto px-4 py-10 sm:py-14">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {saunas.map((sauna, index) => (
              <motion.div
                key={sauna.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.04, transition: { duration: 0.2 } }}
                transition={{ duration: 0.3, delay: index * 0.06 }}
              >
                <Link
                  href={`/complex-50/${sauna.id}`}
                  className="group block h-full"
                >
                  <div className="flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow duration-200 hover:shadow-md">
                    {/* Image placeholder */}
                    <div className="relative aspect-[3/2] bg-gradient-to-br from-wood/30 via-wood-light/20 to-wood/10">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="h-12 w-12 text-foreground/10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                      </div>
                      <span className={`absolute left-3 top-3 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeColors[sauna.type] ?? "bg-muted text-muted-foreground"}`}>
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
