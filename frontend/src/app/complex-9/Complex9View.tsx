"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ComplexHero } from "@/components/ComplexHero";
import type { BranchWithSaunas, Sauna } from "@/lib/types";

interface Complex9ViewProps {
  branch: BranchWithSaunas;
}

const typeBadge = "bg-wood-dark/80 text-white";

function extractNumericId(slug: string): string {
  // "complex-9-family-1" → "1"
  const last = slug.split("-").pop();
  return last ?? slug;
}

function SaunaCard({
  sauna,
  categorySlug,
  index,
}: {
  sauna: Sauna;
  categorySlug: string;
  index: number;
}) {
  const numericId = extractNumericId(sauna.slug);
  const cover = sauna.mainImage ?? sauna.images?.[0] ?? "/placeholder.png";

  const detailHref = `/complex-9/${categorySlug}/${numericId}`;
  const bookHref = `${detailHref}#booking`;

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
          <span
            className={`absolute left-3 top-3 z-10 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${typeBadge}`}
          >
            {sauna.typeLabel ?? sauna.type}
          </span>
        </Link>

        <div className="flex flex-1 flex-col p-5">
          <Link href={detailHref} className="hover:text-forest transition-colors">
            <h3 className="text-lg font-semibold">{sauna.name}</h3>
          </Link>
          {sauna.sizeLabel && (
            <p className="mt-1 text-sm text-muted-foreground">
              {sauna.sizeLabel}
            </p>
          )}
          {sauna.description && (
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground/80">
              {sauna.description}
            </p>
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
            <Link
              href={bookHref}
              className="flex-1 inline-flex items-center justify-center rounded-full bg-forest px-3 py-2 text-sm font-semibold text-white hover:bg-forest/90 transition-colors"
            >
              Забронировать
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Complex9Inner({ branch }: { branch: BranchWithSaunas }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const categories = branch.categories ?? [];
  const allSaunas = categories.flatMap((c) => c.saunas);

  const tabFromUrl = searchParams.get("tab");
  const initialTabSlug =
    categories.find((c) => c.slug === tabFromUrl)?.slug ??
    categories[0]?.slug ??
    "";
  const [activeTabSlug, setActiveTabSlug] = useState(initialTabSlug);

  const activeCategory = categories.find((c) => c.slug === activeTabSlug);
  const activeSaunas = activeCategory?.saunas ?? [];

  const handleTabChange = (slug: string) => {
    setActiveTabSlug(slug);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", slug);
    router.replace(`/complex-9?${params.toString()}`, { scroll: false });
  };

  const heroImages: [string, string, string] | [string] =
    allSaunas.length >= 3
      ? [
          allSaunas[0].mainImage ?? allSaunas[0].images?.[0] ?? "/placeholder.png",
          allSaunas[1].mainImage ?? allSaunas[1].images?.[0] ?? "/placeholder.png",
          allSaunas[2].mainImage ?? allSaunas[2].images?.[0] ?? "/placeholder.png",
        ]
      : [allSaunas[0]?.mainImage ?? "/placeholder.png"];

  const poolCount = allSaunas.filter((s) => s.poolSize).length;
  const typeCount = new Set(allSaunas.map((s) => s.type)).size;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <ComplexHero
        name={branch.name}
        address={branch.address}
        addressMapUrl={`https://yandex.ru/maps/?text=${encodeURIComponent(branch.address)}`}
        phone={branch.phone}
        description={
          branch.description ??
          "Премиальные сауны в Набережных Челнах: парные, бассейны и комнаты отдыха."
        }
        saunaCount={allSaunas.length}
        poolCount={poolCount}
        typeCount={typeCount}
        images={heroImages}
        scrollToId="saunas"
      />

      <main id="saunas" className="container mx-auto flex-1 px-4 py-10 sm:py-14">
        {categories.length > 1 && (
          <div className="mb-10 flex justify-center">
            <div className="relative inline-flex rounded-full bg-secondary p-1 shadow-sm">
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => handleTabChange(cat.slug)}
                  className="relative z-10 rounded-full px-6 py-2.5 text-sm font-medium transition-colors duration-200 sm:px-8 sm:text-base"
                >
                  {activeTabSlug === cat.slug && (
                    <motion.span
                      layoutId="saunaPill"
                      className="absolute inset-0 rounded-full bg-forest shadow-md"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span
                    className={`relative z-10 ${
                      activeTabSlug === cat.slug ? "text-white" : "text-foreground"
                    }`}
                  >
                    {cat.name.replace(" сауна", "")}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTabSlug}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
          >
            {activeSaunas.map((sauna, i) => (
              <SaunaCard
                key={sauna.id}
                sauna={sauna}
                categorySlug={activeCategory?.slug ?? ""}
                index={i}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}

export function Complex9View({ branch }: Complex9ViewProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-muted-foreground">Загрузка…</div>
        </div>
      }
    >
      <Complex9Inner branch={branch} />
    </Suspense>
  );
}
