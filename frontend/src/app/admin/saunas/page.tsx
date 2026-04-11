"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import type { Branch, Sauna, SaunaCategory } from "@/lib/types";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Flame,
  Users,
} from "lucide-react";
import { SaunaEditor } from "./SaunaEditor";

export default function AdminSaunasPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [saunas, setSaunas] = useState<Sauna[]>([]);
  const [categoriesByBranch, setCategoriesByBranch] = useState<Record<number, SaunaCategory[]>>({});
  const [loading, setLoading] = useState(true);
  const [filterBranchId, setFilterBranchId] = useState<number | null>(null);
  const [filterCategoryId, setFilterCategoryId] = useState<number | "all">("all");

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingSauna, setEditingSauna] = useState<Sauna | null>(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [bs, ss] = await Promise.all([
        api.get<Branch[]>("/branches"),
        api.get<Sauna[]>("/saunas"),
      ]);
      setBranches(bs);
      setSaunas(ss);

      // Загружаем категории для каждого филиала
      const cats = await Promise.all(
        bs.map((b) =>
          api
            .get<SaunaCategory[]>(`/categories?branchId=${b.id}`)
            .then((c) => [b.id, c] as const)
            .catch(() => [b.id, []] as const),
        ),
      );
      setCategoriesByBranch(Object.fromEntries(cats));
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // По умолчанию выбираем первый филиал, как только подгрузились
  useEffect(() => {
    if (filterBranchId === null && branches.length > 0) {
      setFilterBranchId(branches[0].id);
    }
  }, [branches, filterBranchId]);

  // Категории для текущего фильтра филиала
  const availableCategories = useMemo(() => {
    if (filterBranchId === null) return [];
    return categoriesByBranch[filterBranchId] ?? [];
  }, [filterBranchId, categoriesByBranch]);

  // Сбрасываем категорию при смене филиала
  useEffect(() => {
    setFilterCategoryId("all");
  }, [filterBranchId]);

  // Отфильтрованные сауны
  const filteredSaunas = useMemo(() => {
    return saunas.filter((s) => {
      if (filterBranchId !== null && s.branchId !== filterBranchId) return false;
      if (filterCategoryId !== "all" && s.categoryId !== filterCategoryId) return false;
      return true;
    });
  }, [saunas, filterBranchId, filterCategoryId]);

  const handleCreate = () => {
    setEditingSauna(null);
    setEditorOpen(true);
  };

  const handleEdit = (sauna: Sauna) => {
    setEditingSauna(sauna);
    setEditorOpen(true);
  };

  const handleDelete = async (sauna: Sauna) => {
    if (!confirm(`Удалить сауну "${sauna.name}"? Это действие необратимо.`)) return;
    try {
      await api.delete(`/saunas/${sauna.id}`);
      loadAll();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Не удалось удалить");
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
          <h2 className="text-2xl font-bold text-foreground">Сауны</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Всего: {saunas.length} · Показано: {filteredSaunas.length}
          </p>
        </div>
        <button
          type="button"
          onClick={handleCreate}
          className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-emerald-700 via-emerald-800 to-emerald-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg ring-1 ring-emerald-500/30 transition-shadow hover:shadow-xl flex items-center gap-2"
        >
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          <Plus className="h-4 w-4" />
          Добавить сауну
        </button>
      </div>

      {/* Кнопки филиалов */}
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {branches.map((b) => {
          const active = filterBranchId === b.id;
          const count = saunas.filter((s) => s.branchId === b.id).length;
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => setFilterBranchId(b.id)}
              className={`group relative overflow-hidden rounded-2xl border-2 px-5 py-4 text-left transition-all ${
                active
                  ? "border-forest bg-forest/10"
                  : "border-border bg-card hover:border-forest/40"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    active ? "bg-forest text-white" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Flame className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-foreground">{b.name}</div>
                  <div className="text-xs text-muted-foreground">{count} саун</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Подкатегории (если есть) */}
      {availableCategories.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilterCategoryId("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filterCategoryId === "all"
                ? "bg-forest text-white"
                : "bg-muted text-muted-foreground hover:bg-forest/15 hover:text-forest"
            }`}
          >
            Все
          </button>
          {availableCategories.map((c) => {
            const active = filterCategoryId === c.id;
            const count = saunas.filter(
              (s) => s.branchId === filterBranchId && s.categoryId === c.id,
            ).length;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setFilterCategoryId(c.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  active
                    ? "bg-forest text-white"
                    : "bg-muted text-muted-foreground hover:bg-forest/15 hover:text-forest"
                }`}
              >
                {c.name} <span className="opacity-60">({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Сетка карточек */}
      {filteredSaunas.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground">
          {saunas.length === 0 ? "Саун пока нет" : "Ничего не найдено"}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSaunas.map((sauna, idx) => {
            const branch = branches.find((b) => b.id === sauna.branchId);
            const category = sauna.categoryId
              ? (categoriesByBranch[sauna.branchId] ?? []).find(
                  (c) => c.id === sauna.categoryId,
                )
              : null;
            return (
              <motion.div
                key={sauna.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.04 }}
                style={{ willChange: "transform, opacity" }}
                className="group rounded-2xl border border-border bg-card overflow-hidden transition-shadow hover:shadow-lg"
              >
                {/* Фото */}
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                  {sauna.mainImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={sauna.mainImage}
                      alt={sauna.name}
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground/30">
                      <Flame className="h-10 w-10" />
                    </div>
                  )}
                  {!sauna.isActive && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                      Отключена
                    </span>
                  )}
                </div>

                {/* Контент */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-foreground leading-tight">
                      {sauna.name}
                    </h3>
                    <span className="shrink-0 text-xs text-forest font-medium">
                      от {sauna.priceFrom ?? "—"}₽
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {sauna.typeLabel ?? sauna.type}
                    {sauna.sizeLabel && ` · ${sauna.sizeLabel}`}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {sauna.capacity}
                    </span>
                    <span>·</span>
                    <span>{branch?.name}</span>
                    {category && (
                      <>
                        <span>·</span>
                        <span>{category.name}</span>
                      </>
                    )}
                  </div>

                  {sauna.description && (
                    <p className="text-xs text-muted-foreground/80 line-clamp-2 mb-3">
                      {sauna.description}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(sauna)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-forest/40 px-3 py-2 text-xs font-medium text-forest hover:bg-forest/10 transition-colors"
                    >
                      <Pencil className="h-3 w-3" />
                      Изменить
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(sauna)}
                      className="inline-flex items-center justify-center rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-red-400 hover:border-red-500/50 hover:bg-red-500/10 transition-colors"
                      title="Удалить"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Editor Modal */}
      <SaunaEditor
        open={editorOpen}
        sauna={editingSauna}
        branches={branches}
        categoriesByBranch={categoriesByBranch}
        onClose={() => setEditorOpen(false)}
        onSaved={loadAll}
      />
    </div>
  );
}
