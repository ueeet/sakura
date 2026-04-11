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
  Filter,
  Flame,
  Users,
} from "lucide-react";
import { SaunaEditor } from "./SaunaEditor";

export default function AdminSaunasPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [saunas, setSaunas] = useState<Sauna[]>([]);
  const [categoriesByBranch, setCategoriesByBranch] = useState<Record<number, SaunaCategory[]>>({});
  const [loading, setLoading] = useState(true);
  const [filterBranchId, setFilterBranchId] = useState<number | "all">("all");
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

  // Категории для текущего фильтра филиала
  const availableCategories = useMemo(() => {
    if (filterBranchId === "all") return [];
    return categoriesByBranch[filterBranchId] ?? [];
  }, [filterBranchId, categoriesByBranch]);

  // Сбрасываем категорию при смене филиала
  useEffect(() => {
    setFilterCategoryId("all");
  }, [filterBranchId]);

  // Отфильтрованные сауны
  const filteredSaunas = useMemo(() => {
    return saunas.filter((s) => {
      if (filterBranchId !== "all" && s.branchId !== filterBranchId) return false;
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

      {/* Фильтры */}
      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          Фильтр:
        </div>
        <select
          value={filterBranchId}
          onChange={(e) =>
            setFilterBranchId(e.target.value === "all" ? "all" : Number(e.target.value))
          }
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-forest"
        >
          <option value="all">Все филиалы</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        {availableCategories.length > 0 && (
          <select
            value={filterCategoryId}
            onChange={(e) =>
              setFilterCategoryId(
                e.target.value === "all" ? "all" : Number(e.target.value),
              )
            }
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-forest"
          >
            <option value="all">Все категории</option>
            {availableCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}

        {(filterBranchId !== "all" || filterCategoryId !== "all") && (
          <button
            type="button"
            onClick={() => {
              setFilterBranchId("all");
              setFilterCategoryId("all");
            }}
            className="text-xs text-forest hover:underline"
          >
            Сбросить
          </button>
        )}
      </div>

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
