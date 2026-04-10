"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { complex9 } from "@/lib/saunas";
import type { Sauna } from "@/lib/saunas";

const typeBadgeStyles: Record<Sauna["type"], string> = {
  russian: "bg-wood-dark/80 text-white",
  finnish: "bg-wood-dark/80 text-white",
  hamam: "bg-wood-dark/80 text-white",
};

const categories = complex9.categories!;

interface SaunaTab {
  id: string;
  label: string;
}

const saunaTabs: SaunaTab[] = categories.map((c) => ({
  id: c.id,
  label: c.name.replace(" сауна", ""),
}));

function SaunaCard({
  sauna,
  categoryId,
  index,
}: {
  sauna: Sauna;
  categoryId: string;
  index: number;
}) {
  return (
    <motion.div
      key={sauna.id}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.04, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
    >
      <Link
        href={`/complex-9/${categoryId}/${sauna.id}`}
        className="group block h-full"
      >
        <div className="flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow duration-200 hover:shadow-md">
          {/* Image */}
          <div className="relative aspect-[3/2] overflow-hidden bg-muted">
            <Image
              src={sauna.image}
              alt={sauna.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Badge */}
            <span
              className={`absolute left-3 top-3 z-10 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${typeBadgeStyles[sauna.type]}`}
            >
              {sauna.typeLabel}
            </span>
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col p-5">
            <h3 className="text-lg font-semibold">{sauna.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {sauna.sizeLabel}
            </p>
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground/80">
              {sauna.description}
            </p>
            <div className="mt-auto pt-4">
              <span className="inline-flex items-center rounded-full bg-forest/10 px-4 py-1.5 text-sm font-medium text-forest transition-colors group-hover:bg-forest group-hover:text-white">
                Подробнее
                <svg
                  className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function Complex9Content() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const initialTab = saunaTabs.find((t) => t.id === tabFromUrl)?.id ?? saunaTabs[0].id;
  const [activeTab, setActiveTab] = useState(initialTab);
  const activeCategory = categories.find((c) => c.id === activeTab)!;
  const activeSaunas = activeCategory.saunas;

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabId);
    router.replace(`/complex-9?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      {/* Hero */}
      <section className="border-b border-border py-14 sm:py-18">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-heading text-4xl tracking-tight sm:text-5xl lg:text-6xl text-foreground">
            {complex9.name}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">{complex9.address}</p>
          <p className="mt-1 text-muted-foreground">{complex9.phone}</p>
        </div>
      </section>

      {/* Content */}
      <main className="container mx-auto flex-1 px-4 py-10 sm:py-14">
        {/* Animated pill toggle */}
        <div className="mb-10 flex justify-center">
          <div className="relative inline-flex rounded-full bg-secondary p-1 shadow-sm">
            {saunaTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className="relative z-10 rounded-full px-6 py-2.5 text-sm font-medium transition-colors duration-200 sm:px-8 sm:text-base"
              >
                {activeTab === tab.id && (
                  <motion.span
                    layoutId="saunaPill"
                    className="absolute inset-0 rounded-full bg-forest shadow-md"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span
                  className={`relative z-10 ${
                    activeTab === tab.id ? "text-white" : "text-foreground"
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Cards grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
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
                categoryId={activeCategory.id}
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

export default function Complex9Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-muted-foreground">Загрузка…</div>
        </div>
      }
    >
      <Complex9Content />
    </Suspense>
  );
}
