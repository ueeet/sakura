"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ComplexHero } from "@/components/ComplexHero";
import type { BranchWithSaunas, Sauna } from "@/lib/types";

const badge = "bg-wood-dark/80 text-white";

function extractNumericId(slug: string): string {
  const last = slug.split("-").pop();
  return last ?? slug;
}

function SaunaCard({ sauna, index }: { sauna: Sauna; index: number }) {
  const numericId = extractNumericId(sauna.slug);
  const cover = sauna.mainImage ?? sauna.images?.[0] ?? "/placeholder.png";

  return (
    <motion.div
      key={sauna.id}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
    >
      <Link
        href={`/complex-50/${numericId}`}
        className="group block h-full"
      >
        <div className="flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-[box-shadow,transform] duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="relative aspect-[3/2] overflow-hidden bg-muted">
            <Image
              src={cover}
              alt={sauna.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span className={`absolute left-3 top-3 z-10 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge}`}>
              {sauna.typeLabel ?? sauna.type}
            </span>
          </div>
          <div className="flex flex-1 flex-col p-5">
            <h3 className="text-lg font-semibold">{sauna.name}</h3>
            {sauna.sizeLabel && (
              <p className="mt-1 text-sm text-muted-foreground">{sauna.sizeLabel}</p>
            )}
            {sauna.description && (
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground/80">{sauna.description}</p>
            )}
            {sauna.priceFrom != null && (
              <p className="mt-2 text-sm font-medium text-forest">
                от {sauna.priceFrom}₽/час
              </p>
            )}
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
  );
}

export function Complex50View({ branch }: { branch: BranchWithSaunas }) {
  // У complex-50 категорий нет, сауны лежат в branch.saunas
  const saunas = branch.saunas ?? [];
  const heroImages: [string, string, string] | [string] =
    saunas.length >= 3
      ? [
          saunas[0].mainImage ?? "/placeholder.png",
          saunas[1].mainImage ?? "/placeholder.png",
          saunas[2].mainImage ?? "/placeholder.png",
        ]
      : [saunas[0]?.mainImage ?? "/placeholder.png"];

  const poolCount = saunas.filter((s) => s.poolSize).length;
  const typeCount = new Set(saunas.map((s) => s.type)).size;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <ComplexHero
          name={branch.name}
          address={branch.address}
          addressMapUrl={`https://yandex.ru/maps/?text=${encodeURIComponent(branch.address)}`}
          phone={branch.phone}
          description={
            branch.description ??
            "Финские и русские сауны с бассейнами, шашлычным двором и мангалом."
          }
          saunaCount={saunas.length}
          poolCount={poolCount}
          typeCount={typeCount}
          images={heroImages}
          scrollToId="saunas"
        />

        <section id="saunas" className="container mx-auto px-4 py-10 sm:py-14">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {saunas.map((sauna, index) => (
              <SaunaCard key={sauna.id} sauna={sauna} index={index} />
            ))}
          </div>

          <p className="text-center text-muted-foreground mt-10 text-sm">
            Мангал и шашлычный двор доступны за дополнительную плату
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
