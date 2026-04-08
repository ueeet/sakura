"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { api } from "@/lib/api";
import type { PortfolioWork } from "@/lib/types";

export default function PortfolioPage() {
  const [works, setWorks] = useState<PortfolioWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    api.get<PortfolioWork[]>("/portfolio")
      .then(setWorks)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = ["all", ...new Set(works.map((w) => w.category || "Другое"))];
  const filtered = selectedCategory === "all" ? works : works.filter((w) => (w.category || "Другое") === selectedCategory);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">Портфолио</h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Наши лучшие работы
          </p>

          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? "bg-pink-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {cat === "all" ? "Все" : cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center text-gray-500">Загрузка...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((work) => (
                <div key={work.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                  {work.beforePhoto && work.afterPhoto ? (
                    <div className="grid grid-cols-2 gap-0.5">
                      <div className="aspect-square overflow-hidden">
                        <img src={work.beforePhoto} alt="До" className="w-full h-full object-cover" />
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 text-white text-xs rounded">До</span>
                      </div>
                      <div className="aspect-square overflow-hidden">
                        <img src={work.afterPhoto} alt="После" className="w-full h-full object-cover" />
                        <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 text-white text-xs rounded">После</span>
                      </div>
                    </div>
                  ) : (work.afterPhoto || work.beforePhoto) ? (
                    <div className="aspect-video overflow-hidden">
                      <img src={work.afterPhoto || work.beforePhoto!} alt={work.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/20 dark:to-rose-900/20" />
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{work.title}</h3>
                    {work.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{work.description}</p>}
                    <p className="text-xs text-pink-600 dark:text-pink-400 mt-2">Мастер: {work.staff.name}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
