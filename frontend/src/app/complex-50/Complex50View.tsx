"use client";

import { Suspense, useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ComplexHero } from "@/components/ComplexHero";
import { BookingModal } from "@/components/BookingModal";
import { SaunaCardCarousel } from "@/components/SaunaCardCarousel";
import { SaunaFilters, applyFilters, defaultFilters, type SaunaFilterState } from "@/components/SaunaFilters";
import { useAvailabilityFromUrl } from "@/lib/useAvailabilityFromUrl";
import type { BranchWithSaunas, Sauna } from "@/lib/types";
import { Users } from "lucide-react";

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
  const images = [...new Set([sauna.mainImage, ...(sauna.images ?? [])].filter(Boolean) as string[])];
  if (images.length === 0) images.push("/placeholder.png");
  const detailHref = `/complex-50/${numericId}`;

  return (
    <motion.div
      key={sauna.id}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.3, ease: "easeOut" } }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="group"
    >
      <div className="flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow duration-300 hover:shadow-md">
        <Link href={detailHref} className="relative block aspect-[3/2] overflow-hidden bg-muted">
          <SaunaCardCarousel images={images} alt={sauna.name} />
          <span className={`absolute left-3 top-3 z-10 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge}`}>
            {sauna.typeLabel ?? sauna.type}
          </span>
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
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground/80">{sauna.description}</p>
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

function Complex50Inner({ branch }: { branch: BranchWithSaunas }) {
  const searchParams = useSearchParams();

  const allSaunas = branch.saunas ?? [];
  const guestsParam = searchParams.get("guests");
  const initialCapacity = guestsParam ? Math.max(1, parseInt(guestsParam, 10)) : 0;
  const [filters, setFilters] = useState<SaunaFilterState>({
    ...defaultFilters,
    minCapacity: initialCapacity,
  });

  const saunas = useMemo(
    () => applyFilters(allSaunas, filters),
    [allSaunas, filters],
  );

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
          <SaunaFilters
            filters={filters}
            onChange={setFilters}
            saunas={allSaunas}
            showSchedule={false}
          />

          {saunas.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground">
              Нет саун, подходящих под выбранное количество гостей
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {saunas.map((sauna, index) => (
                <SaunaCard key={sauna.id} sauna={sauna} index={index} onBook={setBookingSauna} />
              ))}
            </div>
          )}

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

export function Complex50View({ branch }: { branch: BranchWithSaunas }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-muted-foreground">Загрузка…</div>
        </div>
      }
    >
      <Complex50Inner branch={branch} />
    </Suspense>
  );
}
