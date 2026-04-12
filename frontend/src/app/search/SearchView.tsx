"use client";

import { Suspense, useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BookingModal } from "@/components/BookingModal";
import { SaunaCardCarousel } from "@/components/SaunaCardCarousel";
import { SaunaFilters, applyFilters, defaultFilters, type SaunaFilterState } from "@/components/SaunaFilters";
import type { Sauna } from "@/lib/types";
import { Search, Users } from "lucide-react";

const typeBadge = "bg-wood-dark/80 text-white";

function extractNumericId(slug: string): string {
  const last = slug.split("-").pop();
  return last ?? slug;
}

function detailHrefFor(sauna: Sauna): string {
  const branchSlug = sauna.branch?.slug;
  const categorySlug = sauna.category?.slug;
  const numericId = extractNumericId(sauna.slug);
  if (branchSlug === "complex-9" && categorySlug) {
    return `/complex-9/${categorySlug}/${numericId}`;
  }
  if (branchSlug === "complex-50") {
    return `/complex-50/${numericId}`;
  }
  return `/${branchSlug}/${numericId}`;
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
  const images = [...new Set([sauna.mainImage, ...(sauna.images ?? [])].filter(Boolean) as string[])];
  if (images.length === 0) images.push("/placeholder.png");
  const detailHref = detailHrefFor(sauna);

  return (
    <motion.div
      key={sauna.id}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.3, ease: "easeOut" } }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
      className="group"
    >
      <div className="flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow duration-300 hover:shadow-md">
        <Link href={detailHref} className="relative block aspect-[3/2] overflow-hidden bg-muted">
          <SaunaCardCarousel images={images} alt={sauna.name} />
          <span
            className={`absolute left-3 top-3 z-10 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${typeBadge}`}
          >
            {sauna.typeLabel ?? sauna.type}
          </span>
          {sauna.branch && (
            <span className="absolute right-3 top-3 z-10 inline-flex items-center rounded-full bg-black/60 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
              {sauna.branch.name}
            </span>
          )}
        </Link>

        <div className="flex flex-1 flex-col p-5">
          <Link href={detailHref} className="hover:text-forest transition-colors">
            <h3 className="text-lg font-semibold">{sauna.name}</h3>
          </Link>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            {sauna.sizeLabel && <span>{sauna.sizeLabel}</span>}
            {sauna.sizeLabel && sauna.capacity > 0 && <span>·</span>}
            {sauna.capacity > 0 && (
              <span className="inline-flex items-center gap-1">
                <Users className="h-3 w-3" />
                до {sauna.capacity} гостей
              </span>
            )}
          </div>
          {sauna.description && (
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground/80">
              {sauna.description}
            </p>
          )}
          {sauna.priceFrom != null && (
            <p className="mt-3 text-lg font-bold text-forest">
              от {sauna.priceFrom}₽<span className="text-xs font-medium text-muted-foreground">/час</span>
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

function SearchInner({ allSaunas }: { allSaunas: Sauna[] }) {
  const searchParams = useSearchParams();
  const [bookingSauna, setBookingSauna] = useState<Sauna | null>(null);

  // Инициализируем фильтры из URL (?guests=N)
  const guestsParam = searchParams.get("guests");
  const initialCapacity = guestsParam ? Math.max(1, parseInt(guestsParam, 10)) : 0;
  const [filters, setFilters] = useState<SaunaFilterState>({
    ...defaultFilters,
    minCapacity: initialCapacity,
  });

  const filtered = useMemo(
    () => applyFilters(allSaunas, filters),
    [allSaunas, filters],
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="container mx-auto flex-1 px-4 py-10 sm:py-14">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest/15 text-forest">
              <Search className="h-5 w-5" />
            </div>
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
              Все сауны
            </h1>
          </div>
          <p className="text-muted-foreground">
            {filtered.length === allSaunas.length
              ? `Найдено ${allSaunas.length} саун в обоих филиалах`
              : `Найдено ${filtered.length} из ${allSaunas.length} саун`}
          </p>
        </div>

        <SaunaFilters
          filters={filters}
          onChange={setFilters}
          saunas={allSaunas}
        />

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground">
            Нет саун, подходящих под выбранное количество гостей
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((sauna, i) => (
              <SaunaCard
                key={sauna.id}
                sauna={sauna}
                index={i}
                onBook={setBookingSauna}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />

      <BookingModal
        sauna={bookingSauna}
        onClose={() => setBookingSauna(null)}
      />
    </div>
  );
}

export function SearchView({ allSaunas }: { allSaunas: Sauna[] }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-muted-foreground">Загрузка…</div>
        </div>
      }
    >
      <SearchInner allSaunas={allSaunas} />
    </Suspense>
  );
}
