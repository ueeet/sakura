"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { api } from "@/lib/api";
import type { Review } from "@/lib/types";
import { Star } from "lucide-react";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Review[]>("/reviews")
      .then(setReviews)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto px-4 py-20">
          <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">Отзывы</h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            Что говорят о нас наши клиенты
          </p>

          {loading ? (
            <div className="text-center text-gray-500">Загрузка...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center text-gray-500">Отзывов пока нет</div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{review.authorName}</h3>
                      <span className="text-xs text-gray-500 capitalize">{review.source}</span>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{review.text}</p>
                  <p className="text-xs text-gray-400 mt-3">{new Date(review.createdAt).toLocaleDateString("ru-RU")}</p>
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
