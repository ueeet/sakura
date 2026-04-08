"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { onSSE } from "@/lib/sse";
import type { Review } from "@/lib/types";
import { Check, Eye, EyeOff, Trash2, Star } from "lucide-react";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => { api.get<Review[]>("/reviews/all").then(setReviews).catch(() => {}).finally(() => setLoading(false)); };

  useEffect(() => {
    load();
    return onSSE(load);
  }, []);

  const approve = async (id: number) => {
    try { await api.put(`/reviews/${id}`, { isApproved: true }); load(); } catch {}
  };

  const toggleVisibility = async (id: number, isVisible: boolean) => {
    try { await api.put(`/reviews/${id}`, { isVisible: !isVisible }); load(); } catch {}
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить отзыв?")) return;
    try { await api.delete(`/reviews/${id}`); load(); } catch {}
  };

  if (loading) return <div className="text-gray-500">Загрузка...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Отзывы</h2>

      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className={`p-4 bg-white dark:bg-gray-900 rounded-xl border ${r.isApproved ? "border-gray-200 dark:border-gray-800" : "border-yellow-300 dark:border-yellow-700"}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900 dark:text-white">{r.authorName}</span>
                  <span className="text-xs text-gray-500 capitalize">{r.source}</span>
                  {!r.isApproved && <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs rounded-full">На модерации</span>}
                </div>
                <div className="flex gap-0.5 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                  ))}
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{r.text}</p>
                <p className="text-xs text-gray-400 mt-2">{new Date(r.createdAt).toLocaleDateString("ru-RU")}</p>
              </div>
              <div className="flex gap-1 ml-4">
                {!r.isApproved && (
                  <button onClick={() => approve(r.id)} className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg" title="Одобрить">
                    <Check className="h-4 w-4" />
                  </button>
                )}
                <button onClick={() => toggleVisibility(r.id, r.isVisible)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg" title={r.isVisible ? "Скрыть" : "Показать"}>
                  {r.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <button onClick={() => handleDelete(r.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg" title="Удалить">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {reviews.length === 0 && <div className="text-center text-gray-500 py-8">Отзывов пока нет</div>}
      </div>
    </div>
  );
}
