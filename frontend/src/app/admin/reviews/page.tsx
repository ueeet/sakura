"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { onSSE } from "@/lib/sse";
import type { Review } from "@/lib/types";
import { Check, Eye, EyeOff, Trash2, Star, Loader2 } from "lucide-react";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api
      .get<Review[]>("/reviews/all")
      .then(setReviews)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    return onSSE(load);
  }, []);

  const approve = async (id: number) => {
    try {
      await api.put(`/reviews/${id}`, { isApproved: true });
      load();
    } catch {}
  };

  const toggleVisibility = async (id: number, isVisible: boolean) => {
    try {
      await api.put(`/reviews/${id}`, { isVisible: !isVisible });
      load();
    } catch {}
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить отзыв?")) return;
    try {
      await api.delete(`/reviews/${id}`);
      load();
    } catch {}
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Отзывы</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {reviews.length === 0 ? "Отзывов пока нет" : `Всего: ${reviews.length}`}
        </p>
      </div>

      <div className="space-y-3">
        {reviews.map((r) => (
          <div
            key={r.id}
            className={`p-5 bg-card rounded-2xl border transition-colors ${
              r.isApproved ? "border-border" : "border-amber-500/40"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="font-semibold text-foreground">
                    {r.authorName}
                  </span>
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    {r.source}
                  </span>
                  {!r.isApproved && (
                    <span className="px-2 py-0.5 bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs rounded-full">
                      На модерации
                    </span>
                  )}
                  {!r.isVisible && (
                    <span className="px-2 py-0.5 bg-muted text-muted-foreground border border-border text-xs rounded-full">
                      Скрыт
                    </span>
                  )}
                </div>
                <div className="flex gap-0.5 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < r.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed">
                  {r.text}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(r.createdAt).toLocaleDateString("ru-RU", {
                    timeZone: "Europe/Moscow",
                  })}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                {!r.isApproved && (
                  <button
                    onClick={() => approve(r.id)}
                    className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                    title="Одобрить"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => toggleVisibility(r.id, r.isVisible)}
                  className="p-2 text-muted-foreground hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                  title={r.isVisible ? "Скрыть" : "Показать"}
                >
                  {r.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Удалить"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {reviews.length === 0 && (
          <div className="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground">
            Отзывов пока нет
          </div>
        )}
      </div>
    </div>
  );
}
