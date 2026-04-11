"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Loader2,
  Upload,
  Trash2,
  Plus,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { api } from "@/lib/api";
import type { Branch, Sauna, SaunaCategory } from "@/lib/types";

interface SaunaEditorProps {
  open: boolean;
  sauna: Sauna | null; // null = создание новой
  branches: Branch[];
  /** Категории по branchId — для select при создании */
  categoriesByBranch: Record<number, SaunaCategory[]>;
  onClose: () => void;
  onSaved: () => void;
}

interface FormState {
  branchId: number;
  categoryId: number | null;
  slug: string;
  name: string;
  type: "russian" | "finnish" | "hamam";
  typeLabel: string;
  size: "small" | "large";
  sizeLabel: string;
  description: string;
  capacity: number;
  poolSize: string;
  hasBBQ: boolean;
  mainImage: string;
  images: string[];
  amenities: string[];
  extras: string[];
  cleaningMinutes: number;
  minHours: number;
  depositPercent: number;
}

const TYPE_LABELS: Record<FormState["type"], string> = {
  russian: "Русская сауна",
  finnish: "Финская сауна",
  hamam: "Турецкий хамам",
};

const SIZE_LABELS: Record<FormState["size"], string> = {
  small: "Малый зал",
  large: "Большой зал",
};

function emptyForm(branchId: number): FormState {
  return {
    branchId,
    categoryId: null,
    slug: "",
    name: "",
    type: "finnish",
    typeLabel: TYPE_LABELS.finnish,
    size: "small",
    sizeLabel: SIZE_LABELS.small,
    description: "",
    capacity: 6,
    poolSize: "",
    hasBBQ: false,
    mainImage: "",
    images: [],
    amenities: [],
    extras: [],
    cleaningMinutes: 60,
    minHours: 1,
    depositPercent: 30,
  };
}

function saunaToForm(s: Sauna): FormState {
  return {
    branchId: s.branchId,
    categoryId: s.categoryId,
    slug: s.slug,
    name: s.name,
    type: s.type,
    typeLabel: s.typeLabel ?? TYPE_LABELS[s.type],
    size: (s.size ?? "small") as "small" | "large",
    sizeLabel: s.sizeLabel ?? SIZE_LABELS[(s.size ?? "small") as "small" | "large"],
    description: s.description ?? "",
    capacity: s.capacity,
    poolSize: s.poolSize ?? "",
    hasBBQ: s.hasBBQ,
    mainImage: s.mainImage ?? "",
    images: s.images ?? [],
    amenities: s.amenities ?? [],
    extras: s.extras ?? [],
    cleaningMinutes: s.cleaningMinutes,
    minHours: s.minHours,
    depositPercent: s.depositPercent,
  };
}

export function SaunaEditor({
  open,
  sauna,
  branches,
  categoriesByBranch,
  onClose,
  onSaved,
}: SaunaEditorProps) {
  const [form, setForm] = useState<FormState>(() => emptyForm(branches[0]?.id ?? 1));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"main" | "extra" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const mainFileRef = useRef<HTMLInputElement>(null);
  const extraFileRef = useRef<HTMLInputElement>(null);

  // Реинициализация формы при открытии
  useEffect(() => {
    if (!open) return;
    setError(null);
    setSuccess(false);
    if (sauna) {
      setForm(saunaToForm(sauna));
    } else {
      setForm(emptyForm(branches[0]?.id ?? 1));
    }
  }, [open, sauna, branches]);

  // Esc close
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const isCreating = sauna === null;

  // Текущие категории для выбранного филиала
  const branchCategories = categoriesByBranch[form.branchId] ?? [];

  const handleUpload = async (
    file: File,
    target: "main" | "extra",
  ) => {
    setUploading(target);
    setError(null);
    try {
      const res = await api.upload(file);
      if (target === "main") {
        setForm((f) => ({ ...f, mainImage: res.url }));
      } else {
        setForm((f) => ({ ...f, images: [...f.images, res.url] }));
      }
    } catch {
      setError("Не удалось загрузить фото");
    } finally {
      setUploading(null);
    }
  };

  const removeImage = (idx: number) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const payload = {
      slug: form.slug || undefined,
      name: form.name,
      type: form.type,
      typeLabel: form.typeLabel || TYPE_LABELS[form.type],
      size: form.size,
      sizeLabel: form.sizeLabel || SIZE_LABELS[form.size],
      description: form.description || undefined,
      capacity: form.capacity,
      poolSize: form.poolSize || undefined,
      hasBBQ: form.hasBBQ,
      mainImage: form.mainImage || undefined,
      images: form.images,
      amenities: form.amenities,
      extras: form.extras,
      cleaningMinutes: form.cleaningMinutes,
      minHours: form.minHours,
      depositPercent: form.depositPercent,
      branchId: form.branchId,
      categoryId: form.categoryId,
    };

    try {
      if (isCreating) {
        // Для создания slug обязателен — генерируем по умолчанию если пустой
        if (!payload.slug) {
          const branchSlug = branches.find((b) => b.id === form.branchId)?.slug ?? "branch";
          const cat = branchCategories.find((c) => c.id === form.categoryId);
          const suffix = cat
            ? `${cat.slug}-${Date.now().toString(36).slice(-4)}`
            : `${Date.now().toString(36).slice(-4)}`;
          payload.slug = `${branchSlug}-${suffix}`;
        }
        await api.post("/saunas", payload);
      } else if (sauna) {
        await api.put(`/saunas/${sauna.id}`, payload);
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
            {/* Sticky header */}
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-card/95 backdrop-blur p-5">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {isCreating ? "Новая сауна" : "Редактирование"}
                </p>
                <h3 className="mt-0.5 text-xl font-semibold leading-tight">
                  {isCreating ? "Создание сауны" : sauna?.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="Закрыть"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Филиал */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Филиал
                </label>
                <select
                  value={form.branchId}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      branchId: Number(e.target.value),
                      categoryId: null,
                    })
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-forest"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Категория (если есть) */}
              {branchCategories.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Категория
                  </label>
                  <select
                    value={form.categoryId ?? ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        categoryId: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-forest"
                  >
                    <option value="">Без категории</option>
                    {branchCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Название */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Название
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Сауна №1"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-forest"
                />
              </div>

              {/* Тип + Размер */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Тип
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => {
                      const t = e.target.value as FormState["type"];
                      setForm({ ...form, type: t, typeLabel: TYPE_LABELS[t] });
                    }}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-forest"
                  >
                    <option value="finnish">Финская сауна</option>
                    <option value="russian">Русская сауна</option>
                    <option value="hamam">Турецкий хамам</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Размер
                  </label>
                  <select
                    value={form.size}
                    onChange={(e) => {
                      const s = e.target.value as "small" | "large";
                      setForm({ ...form, size: s, sizeLabel: SIZE_LABELS[s] });
                    }}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-forest"
                  >
                    <option value="small">Малый зал</option>
                    <option value="large">Большой зал</option>
                  </select>
                </div>
              </div>

              {/* Описание */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Описание
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="Краткое описание сауны..."
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-forest resize-none"
                />
              </div>

              {/* Главное фото */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Главное фото
                </label>
                {form.mainImage ? (
                  <div className="relative w-full max-w-xs aspect-[3/2] rounded-lg overflow-hidden border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.mainImage} alt="Главное фото" className="object-cover w-full h-full" />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, mainImage: "" })}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => mainFileRef.current?.click()}
                    disabled={uploading === "main"}
                    className="flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground hover:border-forest hover:text-forest transition-colors"
                  >
                    {uploading === "main" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    Загрузить фото
                  </button>
                )}
                <input
                  ref={mainFileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUpload(f, "main");
                    e.target.value = "";
                  }}
                />
              </div>

              {/* Дополнительные фото */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Дополнительные фото
                </label>
                {form.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {form.images.map((img, idx) => (
                      <div
                        key={img + idx}
                        className="relative aspect-[3/2] rounded-lg overflow-hidden border border-border group"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt={`Фото ${idx + 1}`} className="object-cover w-full h-full" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        >
                          <Trash2 className="h-5 w-5 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => extraFileRef.current?.click()}
                  disabled={uploading === "extra"}
                  className="flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-2.5 text-sm text-muted-foreground hover:border-forest hover:text-forest transition-colors"
                >
                  {uploading === "extra" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Добавить фото
                </button>
                <input
                  ref={extraFileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUpload(f, "extra");
                    e.target.value = "";
                  }}
                />
              </div>

              {/* Вместимость + бассейн + БВ */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Вместимость (чел)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={form.capacity}
                    onChange={(e) =>
                      setForm({ ...form, capacity: Math.max(1, parseInt(e.target.value) || 1) })
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-forest"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Бассейн (опц.)
                  </label>
                  <input
                    type="text"
                    value={form.poolSize}
                    onChange={(e) => setForm({ ...form, poolSize: e.target.value })}
                    placeholder="3×4 м"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-forest"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.hasBBQ}
                  onChange={(e) => setForm({ ...form, hasBBQ: e.target.checked })}
                  className="h-4 w-4 rounded border-border bg-background text-forest focus:ring-forest focus:ring-offset-0"
                />
                <span className="text-sm">Есть мангал</span>
              </label>

              {/* Настройки бронирования */}
              <details className="rounded-lg border border-border bg-background/50">
                <summary className="cursor-pointer px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground">
                  Настройки бронирования
                </summary>
                <div className="grid grid-cols-3 gap-3 p-3 pt-0">
                  <div>
                    <label className="block text-[10px] font-medium text-muted-foreground mb-1">
                      Уборка (мин)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={form.cleaningMinutes}
                      onChange={(e) =>
                        setForm({ ...form, cleaningMinutes: parseInt(e.target.value) || 0 })
                      }
                      className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm focus:outline-none focus:border-forest"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-muted-foreground mb-1">
                      Мин. часов
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={form.minHours}
                      onChange={(e) =>
                        setForm({ ...form, minHours: Math.max(1, parseInt(e.target.value) || 1) })
                      }
                      className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm focus:outline-none focus:border-forest"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-muted-foreground mb-1">
                      Депозит %
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={form.depositPercent}
                      onChange={(e) =>
                        setForm({ ...form, depositPercent: parseInt(e.target.value) || 0 })
                      }
                      className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm focus:outline-none focus:border-forest"
                    />
                  </div>
                </div>
              </details>

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

            {/* Sticky footer */}
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
                disabled={saving || !form.name}
                className="flex-[2] rounded-lg bg-forest text-white py-2.5 text-sm font-semibold hover:bg-forest/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Сохранение...
                  </>
                ) : isCreating ? (
                  "Создать сауну"
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
