"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import type { Promotion } from "@/lib/types";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Tag,
  Upload,
  Sparkles,
  X,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  ImagePlus,
} from "lucide-react";
import { DatePicker } from "@/components/admin/DatePicker";

/* ───────── helpers ───────── */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

interface FormState {
  slug: string;
  title: string;
  description: string;
  note: string;
  icon: string;
  image: string;
  promoCode: string;
  discount: number | "";
  startDate: string;
  endDate: string;
  sortOrder: number;
  isActive: boolean;
}

function emptyForm(): FormState {
  return {
    slug: "",
    title: "",
    description: "",
    note: "",
    icon: "",
    image: "",
    promoCode: "",
    discount: "",
    startDate: "",
    endDate: "",
    sortOrder: 0,
    isActive: true,
  };
}

function promotionToForm(p: Promotion): FormState {
  return {
    slug: p.slug,
    title: p.title,
    description: p.description,
    note: p.note ?? "",
    icon: p.icon ?? "",
    image: p.image ?? "",
    promoCode: p.promoCode ?? "",
    discount: p.discount ?? "",
    startDate: p.startDate ? p.startDate.slice(0, 10) : "",
    endDate: p.endDate ? p.endDate.slice(0, 10) : "",
    sortOrder: p.sortOrder,
    isActive: p.isActive,
  };
}

const ICON_OPTIONS = [
  { value: "", label: "Без иконки" },
  { value: "flame", label: "Огонь" },
  { value: "gift", label: "Подарок" },
  { value: "cake", label: "Торт" },
  { value: "percent", label: "Процент" },
  { value: "star", label: "Звезда" },
  { value: "heart", label: "Сердце" },
  { value: "zap", label: "Молния" },
  { value: "crown", label: "Корона" },
  { value: "party-popper", label: "Хлопушка" },
];

/* ───────── main page ───────── */

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const data = await api.get<Promotion[]>("/promotions/all");
      setPromotions(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleCreate = () => {
    setEditingPromo(null);
    setEditorOpen(true);
  };

  const handleEdit = (promo: Promotion) => {
    setEditingPromo(promo);
    setEditorOpen(true);
  };

  const handleDelete = async (promo: Promotion) => {
    if (!confirm(`Удалить акцию "${promo.title}"? Это действие необратимо.`)) return;
    try {
      await api.delete(`/promotions/${promo.id}`);
      loadAll();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Не удалось удалить");
    }
  };

  const handleToggle = async (promo: Promotion) => {
    try {
      await api.put(`/promotions/${promo.id}`, { isActive: !promo.isActive });
      loadAll();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка");
    }
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
          <h2 className="text-2xl font-bold text-foreground">Акции</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Всего: {promotions.length} · Активных:{" "}
            {promotions.filter((p) => p.isActive).length}
          </p>
        </div>
        <button
          type="button"
          onClick={handleCreate}
          className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-emerald-700 via-emerald-800 to-emerald-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg ring-1 ring-emerald-500/30 transition-shadow hover:shadow-xl flex items-center gap-2"
        >
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          <Plus className="h-4 w-4" />
          Добавить акцию
        </button>
      </div>

      {/* Grid */}
      {promotions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
          <Tag className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">Акций пока нет</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {promotions.map((promo, idx) => (
            <motion.div
              key={promo.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.04 }}
              style={{ willChange: "transform, opacity" }}
              className="group rounded-2xl border border-border bg-card overflow-hidden transition-shadow hover:shadow-lg"
            >
              {/* Image */}
              <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                {promo.image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={promo.image}
                    alt={promo.title}
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground/30">
                    <Tag className="h-10 w-10" />
                  </div>
                )}
                <div className="absolute top-2 left-2 flex gap-1.5">
                  {!promo.isActive && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                      Отключена
                    </span>
                  )}
                  {promo.discount && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      -{promo.discount}%
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-foreground leading-tight mb-1">
                  {promo.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {promo.description}
                </p>

                {promo.promoCode && (
                  <div className="mb-2 inline-flex items-center gap-1.5 rounded-md border border-forest/30 bg-forest/5 px-2 py-0.5 text-xs font-mono text-forest">
                    {promo.promoCode}
                  </div>
                )}

                {(promo.startDate || promo.endDate) && (
                  <p className="text-[10px] text-muted-foreground mb-3">
                    {promo.startDate && new Date(promo.startDate).toLocaleDateString("ru")}
                    {promo.startDate && promo.endDate && " — "}
                    {promo.endDate && new Date(promo.endDate).toLocaleDateString("ru")}
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggle(promo)}
                    className="inline-flex items-center justify-center rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    title={promo.isActive ? "Отключить" : "Включить"}
                  >
                    {promo.isActive ? (
                      <EyeOff className="h-3 w-3" />
                    ) : (
                      <Eye className="h-3 w-3" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEdit(promo)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-forest/40 px-3 py-2 text-xs font-medium text-forest hover:bg-forest/10 transition-colors"
                  >
                    <Pencil className="h-3 w-3" />
                    Изменить
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(promo)}
                    className="inline-flex items-center justify-center rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-red-400 hover:border-red-500/50 hover:bg-red-500/10 transition-colors"
                    title="Удалить"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      <PromotionEditor
        open={editorOpen}
        promotion={editingPromo}
        onClose={() => setEditorOpen(false)}
        onSaved={loadAll}
      />
    </div>
  );
}

/* ───────── editor modal ───────── */

interface EditorProps {
  open: boolean;
  promotion: Promotion | null;
  onClose: () => void;
  onSaved: () => void;
}

function PromotionEditor({ open, promotion, onClose, onSaved }: EditorProps) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // AI generation state
  const [aiOpen, setAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiPreview, setAiPreview] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiReference, setAiReference] = useState<string | null>(null); // data:image/...;base64,...

  const fileRef = useRef<HTMLInputElement>(null);
  const refFileRef = useRef<HTMLInputElement>(null);

  const isCreating = promotion === null;

  useEffect(() => {
    if (!open) return;
    setError(null);
    setSuccess(false);
    setAiOpen(false);
    setAiPreview(null);
    setAiError(null);
    setAiPrompt("");
    setAiReference(null);
    setForm(promotion ? promotionToForm(promotion) : emptyForm());
  }, [open, promotion]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (aiOpen) {
          setAiOpen(false);
        } else {
          onClose();
        }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, aiOpen, onClose]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const res = await api.upload(file);
      setForm((f) => ({ ...f, image: res.url }));
    } catch {
      setError("Не удалось загрузить фото");
    } finally {
      setUploading(false);
    }
  };

  /* ── AI generation ── */
  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setAiGenerating(true);
    setAiError(null);
    setAiPreview(null);

    try {
      // get auth token
      const tokens = typeof window !== "undefined"
        ? { access: localStorage.getItem("accessToken") }
        : { access: null };

      const res = await fetch(`${API_URL}/generate-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokens.access}`,
        },
        body: JSON.stringify({
          prompt: aiPrompt.trim(),
          ...(aiReference ? { referenceImage: aiReference } : {}),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Ошибка сервера" }));
        throw new Error(data.error || `Ошибка ${res.status}`);
      }

      const data = await res.json();
      setAiPreview(data.url);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Не удалось сгенерировать");
    } finally {
      setAiGenerating(false);
    }
  };

  const handleAiAccept = () => {
    if (aiPreview) {
      setForm((f) => ({ ...f, image: aiPreview }));
      setAiOpen(false);
      setAiPreview(null);
      setAiPrompt("");
    }
  };

  /* ── submit ── */
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const payload: Record<string, unknown> = {
      slug: form.slug || form.title.toLowerCase().replace(/[^a-zа-я0-9]+/gi, "-").replace(/^-|-$/g, "") || `promo-${Date.now().toString(36)}`,
      title: form.title,
      description: form.description,
      note: form.note || undefined,
      icon: form.icon || undefined,
      image: form.image || undefined,
      promoCode: form.promoCode || undefined,
      discount: form.discount !== "" ? Number(form.discount) : undefined,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
      sortOrder: form.sortOrder,
      isActive: form.isActive,
    };

    try {
      if (isCreating) {
        await api.post("/promotions", payload);
      } else {
        await api.put(`/promotions/${promotion!.id}`, payload);
      }
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
            className="relative flex w-full max-w-2xl max-h-[92vh] flex-col rounded-t-2xl sm:rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
            style={{ willChange: "transform, opacity" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-card/95 backdrop-blur p-5">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {isCreating ? "Новая акция" : "Редактирование"}
                </p>
                <h3 className="mt-0.5 text-xl font-semibold leading-tight">
                  {isCreating ? "Создание акции" : promotion?.title}
                </h3>
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
              {/* Title + Slug */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Название
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Скидка на День Рождения"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-forest"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Slug (URL)
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="auto-generated-if-empty"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-forest"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Описание
                </label>
                <textarea
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="Опишите акцию..."
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-forest resize-none"
                />
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Подпись (опц.)
                </label>
                <input
                  type="text"
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  placeholder="Дополнительная информация"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-forest"
                />
              </div>

              {/* Image section */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Обложка
                </label>
                {form.image ? (
                  <div className="relative w-full max-w-xs aspect-[3/2] rounded-lg overflow-hidden border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.image} alt="Обложка" className="object-cover w-full h-full" />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, image: "" })}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                      className="flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground hover:border-forest hover:text-forest transition-colors"
                    >
                      {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      Загрузить
                    </button>
                    <button
                      type="button"
                      onClick={() => setAiOpen(true)}
                      className="flex items-center gap-2 rounded-lg border border-dashed border-purple-500/40 bg-purple-500/5 px-4 py-3 text-sm text-purple-400 hover:border-purple-400 hover:bg-purple-500/10 transition-colors"
                    >
                      <Sparkles className="h-4 w-4" />
                      Сгенерировать с ИИ
                    </button>
                  </div>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUpload(f);
                    e.target.value = "";
                  }}
                />
              </div>

              {/* AI Generation Panel */}
              <AnimatePresence>
                {aiOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-medium text-purple-400">
                          <Sparkles className="h-4 w-4" />
                          Генерация обложки с ИИ
                        </div>
                        <button
                          type="button"
                          onClick={() => setAiOpen(false)}
                          className="rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <textarea
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        rows={3}
                        placeholder="Опишите желаемое изображение, например: Баннер для акции скидка 20% на русскую баню, тёплые тона, пар, берёзовые веники..."
                        className="w-full rounded-lg border border-purple-500/20 bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-purple-400 resize-none"
                      />

                      {/* Референс */}
                      {aiReference ? (
                        <div className="flex items-center gap-3">
                          <div className="relative h-16 w-16 rounded-lg overflow-hidden border border-purple-500/30 shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={aiReference} alt="Референс" className="object-cover w-full h-full" />
                            <button
                              type="button"
                              onClick={() => setAiReference(null)}
                              className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity"
                            >
                              <X className="h-4 w-4 text-white" />
                            </button>
                          </div>
                          <span className="text-xs text-purple-400">Референс загружен</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => refFileRef.current?.click()}
                          className="inline-flex items-center gap-2 rounded-lg border border-dashed border-purple-500/30 px-3 py-2 text-xs text-purple-400/70 hover:text-purple-400 hover:border-purple-400/50 transition-colors"
                        >
                          <ImagePlus className="h-3.5 w-3.5" />
                          Добавить референс (опц.)
                        </button>
                      )}
                      <input
                        ref={refFileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => {
                            setAiReference(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                          e.target.value = "";
                        }}
                      />

                      <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleAiGenerate}
                        disabled={aiGenerating || !aiPrompt.trim()}
                        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-shadow disabled:opacity-50"
                      >
                        {aiGenerating ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Генерация...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            Сгенерировать
                          </>
                        )}
                      </button>
                      </div>

                      {aiError && (
                        <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                          <span>{aiError}</span>
                        </div>
                      )}

                      {aiPreview && (
                        <div className="space-y-3">
                          <div className="relative aspect-[3/2] rounded-lg overflow-hidden border border-purple-500/30">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={aiPreview}
                              alt="AI Preview"
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={handleAiAccept}
                              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-forest text-white py-2 text-sm font-semibold hover:bg-forest/90 transition-colors"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              Использовать
                            </button>
                            <button
                              type="button"
                              onClick={handleAiGenerate}
                              disabled={aiGenerating}
                              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-purple-500/40 py-2 text-sm font-medium text-purple-400 hover:bg-purple-500/10 transition-colors"
                            >
                              <Sparkles className="h-4 w-4" />
                              Ещё раз
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Icon + Promo Code + Discount */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Иконка
                  </label>
                  <select
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-forest"
                  >
                    {ICON_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Промокод
                  </label>
                  <input
                    type="text"
                    value={form.promoCode}
                    onChange={(e) => setForm({ ...form, promoCode: e.target.value.toUpperCase() })}
                    placeholder="SALE20"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-forest font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Скидка %
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={form.discount}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        discount: e.target.value === "" ? "" : Math.min(100, Math.max(0, parseInt(e.target.value) || 0)),
                      })
                    }
                    placeholder="20"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-forest"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Дата начала (опц.)
                  </label>
                  <DatePicker
                    value={form.startDate}
                    onChange={(v) => setForm({ ...form, startDate: v })}
                    placeholder="Начало"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Дата окончания (опц.)
                  </label>
                  <DatePicker
                    value={form.endDate}
                    onChange={(v) => setForm({ ...form, endDate: v })}
                    placeholder="Окончание"
                  />
                </div>
              </div>

              {/* Sort + Active */}
              <div className="grid grid-cols-2 gap-3 items-end">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Порядок сортировки
                  </label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-forest"
                  />
                </div>
                <label className="flex items-center gap-3 cursor-pointer pb-1">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="h-4 w-4 rounded border-border bg-background text-forest focus:ring-forest focus:ring-offset-0"
                  />
                  <span className="text-sm">Активна</span>
                </label>
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
                  Сохранено!
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
                disabled={saving || !form.title || !form.description}
                className="flex-[2] rounded-lg bg-forest text-white py-2.5 text-sm font-semibold hover:bg-forest/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Сохранение...
                  </>
                ) : isCreating ? (
                  "Создать акцию"
                ) : (
                  "Сохранить изменения"
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
