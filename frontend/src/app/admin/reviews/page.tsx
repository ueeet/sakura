"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import type { Review } from "@/lib/types";
import {
  Loader2,
  MessageSquare,
  Star,
  Check,
  X,
  Trash2,
  Eye,
  EyeOff,
  Filter,
  Plus,
  AlertCircle,
  CheckCircle2,
  Upload,
  ImageIcon,
} from "lucide-react";

/* ───────── source badge ───────── */

const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
  "2gis": { label: "2ГИС", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  yandex: { label: "Яндекс", color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
  site: { label: "Сайт", color: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
};

function SourceBadge({ source }: { source: string }) {
  const s = SOURCE_LABELS[source] ?? { label: source, color: "bg-muted text-muted-foreground border-border" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${s.color}`}>
      {s.label}
    </span>
  );
}

/* ───────── stars ───────── */

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={i < rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}
          style={{ width: size, height: size }}
        />
      ))}
    </div>
  );
}

/* ───────── filter type ───────── */

type FilterStatus = "all" | "pending" | "approved" | "hidden";

/* ───────── main page ───────── */

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [editorOpen, setEditorOpen] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const data = await api.get<Review[]>("/reviews/all");
      setReviews(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleApprove = async (review: Review) => {
    try {
      await api.put(`/reviews/${review.id}`, { isApproved: !review.isApproved });
      loadAll();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка");
    }
  };

  const handleToggleVisibility = async (review: Review) => {
    try {
      await api.put(`/reviews/${review.id}`, { isVisible: !review.isVisible });
      loadAll();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка");
    }
  };

  const handleDelete = async (review: Review) => {
    if (!confirm(`Удалить отзыв от "${review.authorName}"? Это действие необратимо.`)) return;
    try {
      await api.delete(`/reviews/${review.id}`);
      loadAll();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Не удалось удалить");
    }
  };

  const filtered = reviews.filter((r) => {
    if (filter === "pending") return !r.isApproved;
    if (filter === "approved") return r.isApproved && r.isVisible;
    if (filter === "hidden") return !r.isVisible;
    return true;
  });

  const counts = {
    all: reviews.length,
    pending: reviews.filter((r) => !r.isApproved).length,
    approved: reviews.filter((r) => r.isApproved && r.isVisible).length,
    hidden: reviews.filter((r) => !r.isVisible).length,
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
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Отзывы</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Всего: {reviews.length} · На модерации: {counts.pending} · Опубликовано: {counts.approved}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditorOpen(true)}
          className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-emerald-700 via-emerald-800 to-emerald-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg ring-1 ring-emerald-500/30 transition-shadow hover:shadow-xl flex items-center gap-2"
        >
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          <Plus className="h-4 w-4" />
          Добавить отзыв
        </button>
      </div>

      {/* Filters */}
      <div className="mb-5 flex gap-2 flex-wrap">
        {([
          { key: "all", label: "Все" },
          { key: "pending", label: "На модерации" },
          { key: "approved", label: "Опубликованные" },
          { key: "hidden", label: "Скрытые" },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
              filter === key
                ? "bg-forest/15 text-forest border border-forest/30"
                : "border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Filter className="h-3 w-3" />
            {label}
            <span className="ml-1 rounded-full bg-background px-1.5 py-0.5 text-[10px]">
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      {/* Reviews list */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
          <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            {filter === "all" ? "Отзывов пока нет" : "Нет отзывов в этой категории"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((review, idx) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.03 }}
              style={{ willChange: "transform, opacity" }}
              className={`group rounded-xl border bg-card p-5 transition-shadow hover:shadow-md ${
                !review.isApproved ? "border-amber-500/20" : !review.isVisible ? "border-red-500/20 opacity-60" : "border-border"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left: content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-semibold text-foreground text-sm">
                      {review.authorName}
                    </span>
                    <Stars rating={review.rating} size={13} />
                    <SourceBadge source={review.source} />
                    {!review.isApproved && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        На модерации
                      </span>
                    )}
                    {!review.isVisible && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-500/15 text-red-400 border border-red-500/30">
                        Скрыт
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {review.text}
                  </p>
                  <p className="mt-2 text-[11px] text-muted-foreground/60">
                    {new Date(review.createdAt).toLocaleDateString("ru", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>

                {/* Right: actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleApprove(review)}
                    className={`rounded-lg p-2 text-xs transition-colors ${
                      review.isApproved
                        ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                        : "border border-border text-muted-foreground hover:text-emerald-400 hover:border-emerald-500/40 hover:bg-emerald-500/10"
                    }`}
                    title={review.isApproved ? "Снять одобрение" : "Одобрить"}
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleVisibility(review)}
                    className="rounded-lg border border-border p-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    title={review.isVisible ? "Скрыть" : "Показать"}
                  >
                    {review.isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(review)}
                    className="rounded-lg border border-border p-2 text-xs text-muted-foreground hover:text-red-400 hover:border-red-500/50 hover:bg-red-500/10 transition-colors"
                    title="Удалить"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create review modal */}
      <ReviewEditor
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSaved={loadAll}
      />
    </div>
  );
}

/* ───────── review editor modal ───────── */

interface EditorProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

interface ReviewForm {
  authorName: string;
  text: string;
  rating: number;
  source: "site" | "2gis" | "yandex";
  branchId: string;
}

function emptyForm(): ReviewForm {
  return { authorName: "", text: "", rating: 5, source: "site", branchId: "" };
}

function ReviewEditor({ open, onClose, onSaved }: EditorProps) {
  const [form, setForm] = useState<ReviewForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setSuccess(false);
    setForm(emptyForm());
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const payload: Record<string, unknown> = {
      authorName: form.authorName,
      text: form.text,
      rating: form.rating,
    };
    if (form.branchId) payload.branchId = Number(form.branchId);

    try {
      await api.post("/reviews", payload);
      setSuccess(true);
      setTimeout(() => {
        onSaved();
        onClose();
      }, 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось сохранить");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{ willChange: "opacity" }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative flex w-full max-w-lg max-h-[92vh] flex-col rounded-t-2xl sm:rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
            style={{ willChange: "transform, opacity" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-card/95 backdrop-blur p-5">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Новый отзыв</p>
                <h3 className="mt-0.5 text-xl font-semibold leading-tight">Добавить отзыв</h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Имя автора
                </label>
                <input
                  type="text"
                  required
                  value={form.authorName}
                  onChange={(e) => setForm({ ...form, authorName: e.target.value })}
                  placeholder="Иван Иванов"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-forest"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Текст отзыва
                </label>
                <textarea
                  required
                  value={form.text}
                  onChange={(e) => setForm({ ...form, text: e.target.value })}
                  rows={4}
                  placeholder="Напишите отзыв..."
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-forest resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Оценка
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setForm({ ...form, rating: n })}
                        className="p-1 transition-colors"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            n <= form.rating
                              ? "text-amber-400 fill-amber-400"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Филиал (опц.)
                  </label>
                  <select
                    value={form.branchId}
                    onChange={(e) => setForm({ ...form, branchId: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-forest"
                  >
                    <option value="">Не указан</option>
                    <option value="1">9 комплекс</option>
                    <option value="2">50 комплекс</option>
                  </select>
                </div>
              </div>

              {/* Messages */}
              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  Отзыв добавлен!
                </div>
              )}
            </form>

            {/* Footer */}
            <div className="sticky bottom-0 z-10 border-t border-border bg-card/95 backdrop-blur p-4 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium hover:bg-muted transition-colors"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving || !form.authorName || !form.text}
                className="flex-[2] rounded-lg bg-forest text-white py-2.5 text-sm font-semibold hover:bg-forest/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  "Добавить отзыв"
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
