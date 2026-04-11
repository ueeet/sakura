"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ComplexHero } from "@/components/ComplexHero";
import { BookingModal } from "@/components/BookingModal";
import type { BranchWithSaunas, Sauna } from "@/lib/types";

const badge = "bg-wood-dark/80 text-white";

function extractNumericId(slug: string): string {
  const last = slug.split("-").pop();
  return last ?? slug;
}

function SaunaCard({
  sauna,
  index,
  onBook,
}: {
  sauna: Sauna;
  index: number;
  onBook: (s: Sauna) => void;
}) {
  const numericId = extractNumericId(sauna.slug);
  const cover = sauna.mainImage ?? sauna.images?.[0] ?? "/placeholder.png";
  const detailHref = `/complex-50/${numericId}`;

  return (
    <motion.div
      key={sauna.id}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="group"
    >
      <div className="flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-[box-shadow,transform] duration-200 hover:-translate-y-1 hover:shadow-md">
        <Link href={detailHref} className="relative block aspect-[3/2] overflow-hidden bg-muted">
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
        </Link>
        <div className="flex flex-1 flex-col p-5">
          <Link href={detailHref} className="hover:text-forest transition-colors">
            <h3 className="text-lg font-semibold">{sauna.name}</h3>
          </Link>
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
          <div className="mt-auto pt-4 flex gap-2">
            <Link
              href={detailHref}
              className="flex-1 inline-flex items-center justify-center rounded-full border border-forest/40 px-3 py-2 text-sm font-medium text-forest hover:bg-forest/10 transition-colors"
            >
              Подробнее
            </Link>
            <button
              type="button"
              onClick={() => onBook(sauna)}
              className="flex-1 inline-flex items-center justify-center rounded-full bg-forest px-3 py-2 text-sm font-semibold text-white hover:bg-forest/90 transition-colors"
            >
              Забронировать
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Complex50Inner({ branch }: { branch: BranchWithSaunas }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const allSaunas = branch.saunas ?? [];
  const guestsParam = searchParams.get("guests");
  const guestsFilter = guestsParam ? Math.max(1, parseInt(guestsParam, 10)) : null;

  // Применяем фильтр по гостям
  const saunas = guestsFilter
    ? allSaunas.filter((s) => s.capacity >= guestsFilter)
    : allSaunas;

  const [bookingSauna, setBookingSauna] = useState<Sauna | null>(null);
  const heroImages: [string, string, string] | [string] =
    allSaunas.length >= 3
      ? [
          allSaunas[0].mainImage ?? "/placeholder.png",
          allSaunas[1].mainImage ?? "/placeholder.png",
          allSaunas[2].mainImage ?? "/placeholder.png",
        ]
      : [allSaunas[0]?.mainImage ?? "/placeholder.png"];

  const poolCount = allSaunas.filter((s) => s.poolSize).length;
  const typeCount = new Set(allSaunas.map((s) => s.type)).size;

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
              <SaunaCard key={sauna.id} sauna={sauna} index={index} onBook={setBookingSauna} />
            ))}
          </div>

          <p className="text-center text-muted-foreground mt-10 text-sm">
            Мангал и шашлычный двор доступны за дополнительную плату
          </p>
        </section>
      </main>
      <Footer />

      <BookingModal sauna={bookingSauna} onClose={() => setBookingSauna(null)} />
    </>
  );
}
