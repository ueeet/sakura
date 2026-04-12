"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { api } from "@/lib/api";
import type { Settings, HomeSlide } from "@/lib/types";
import {
  CheckCircle2,
  Loader2,
  Upload,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  ImageIcon,
} from "lucide-react";

/**
 * Редактор слайдов карусели «О Сакуре» на главной странице.
 *
 * Хранится внутри Settings.homeCarouselSlides (Json). PUT /api/settings
 * с массивом { image }[] сохраняет + на бэке инвалидируется
 * home:slides кеш + на фронте revalidateTag("home").
 */
export default function AdminHomePage() {
  const [slides, setSlides] = useState<HomeSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState<number | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const newFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api
      .get<Settings>("/settings")
      .then((s) => {
        setSlides(Array.isArray(s.homeCarouselSlides) ? s.homeCarouselSlides : []);
      })
      .catch(() => setError("Не удалось загрузить настройки"))
      .finally(() => setLoading(false));
  }, []);

  const removeSlide = (idx: number) => {
    setSlides((prev) => prev.filter((_, i) => i !== idx));
  };

  const moveSlide = (idx: number, dir: -1 | 1) => {
    setSlides((prev) => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const handleReplaceImage = async (idx: number, file: File) => {
    setUploadingIdx(idx);
    setError(null);
    try {
      const res = await api.upload(file);
      setSlides((prev) =>
        prev.map((s, i) => (i === idx ? { image: res.url } : s)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить фото");
    } finally {
      setUploadingIdx(null);
    }
  };

  const handleAddSlide = async (file: File) => {
    setUploadingIdx("new");
    setError(null);
    try {
      const res = await api.upload(file);
      setSlides((prev) => [...prev, { image: res.url }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить фото");
    } finally {
      setUploadingIdx(null);
      if (newFileRef.current) newFileRef.current.value = "";
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await api.put("/settings", { homeCarouselSlides: slides });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось сохранить");
    } finally {
      setSaving(false);
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
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Главная страница</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Слайды карусели в секции «О Сакуре». Порядок — как они появятся
          в карусели. Рекомендуемый формат фото — 4:3.
        </p>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Слайды сохранены
        </div>
      )}

      <div className="max-w-2xl space-y-3">
        {slides.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
            <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              Пока нет слайдов. Добавьте первый ниже.
            </p>
          </div>
        )}

        {slides.map((slide, idx) => (
          <div
            key={idx}
            className="flex items-center gap-4 rounded-2xl border border-border bg-card p-3"
          >
            {/* Порядковый номер — сразу понятно, какая это строка и куда она поедет */}
            <div className="w-6 text-center text-sm font-medium tabular-nums text-muted-foreground">
              {idx + 1}
            </div>

            {/* Превью — компактное, 128×96 */}
            <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-lg bg-muted">
              {slide.image ? (
                <Image
                  src={slide.image}
                  alt={`Слайд ${idx + 1}`}
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <ImageIcon className="h-6 w-6" />
                </div>
              )}
              {uploadingIdx === idx && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                </div>
              )}
            </div>

            {/* Стрелки порядка — вертикально, как на самих слайдах */}
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => moveSlide(idx, -1)}
                disabled={idx === 0}
                className="inline-flex items-center justify-center rounded-md border border-border bg-background p-1.5 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                aria-label="Вверх"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => moveSlide(idx, 1)}
                disabled={idx === slides.length - 1}
                className="inline-flex items-center justify-center rounded-md border border-border bg-background p-1.5 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                aria-label="Вниз"
              >
                <ArrowDown className="h-4 w-4" />
              </button>
            </div>

            {/* Действия справа */}
            <div className="ml-auto flex items-center gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted">
                <Upload className="h-4 w-4" />
                Заменить
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleReplaceImage(idx, file);
                    e.target.value = "";
                  }}
                />
              </label>
              <button
                type="button"
                onClick={() => removeSlide(idx)}
                className="inline-flex items-center justify-center rounded-lg border border-red-500/30 bg-red-500/5 p-2 text-red-400 transition-colors hover:bg-red-500/10"
                aria-label="Удалить"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        {/* Добавить слайд */}
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-card/40 p-5 text-sm font-medium text-muted-foreground transition-colors hover:border-forest/50 hover:text-foreground">
          {uploadingIdx === "new" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Загружается...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Добавить слайд
            </>
          )}
          <input
            ref={newFileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleAddSlide(file);
            }}
          />
        </label>
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-emerald-700 via-emerald-800 to-emerald-900 px-6 py-2.5 text-sm font-semibold text-white shadow-lg ring-1 ring-emerald-500/30 transition-shadow hover:shadow-xl disabled:opacity-50 sm:w-auto"
        >
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Сохранение...
            </>
          ) : (
            "Сохранить"
          )}
        </button>
      </div>
    </div>
  );
}
