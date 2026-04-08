"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { api } from "@/lib/api";
import type { Service } from "@/lib/types";
import { Clock } from "lucide-react";

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Service[]>("/services")
      .then(setServices)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = [...new Set(services.map((s) => s.category || "Другое"))];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">Наши услуги</h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            Полный спектр профессиональных услуг для вас
          </p>

          {loading ? (
            <div className="text-center text-gray-500">Загрузка...</div>
          ) : (
            categories.map((cat) => (
              <div key={cat} className="mb-12">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">{cat}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services
                    .filter((s) => (s.category || "Другое") === cat)
                    .map((service) => (
                      <div key={service.id} className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{service.name}</h3>
                        {service.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{service.description}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-pink-600 dark:text-pink-400">{service.price} руб.</span>
                          <span className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="h-4 w-4" />
                            {service.duration} мин.
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
