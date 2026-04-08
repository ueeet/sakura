"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { PortfolioWork, Staff } from "@/lib/types";
import { Plus, Pencil, Trash2, X } from "lucide-react";

export default function AdminPortfolioPage() {
  const [works, setWorks] = useState<PortfolioWork[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PortfolioWork | null>(null);
  const [form, setForm] = useState({ title: "", description: "", beforePhoto: "", afterPhoto: "", category: "", staffId: "" });

  const load = () => {
    Promise.all([
      api.get<PortfolioWork[]>("/portfolio"),
      api.get<Staff[]>("/staff"),
    ]).then(([p, s]) => { setWorks(p); setStaff(s); }).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm({ title: "", description: "", beforePhoto: "", afterPhoto: "", category: "", staffId: "" }); setShowForm(true); };
  const openEdit = (w: PortfolioWork) => { setEditing(w); setForm({ title: w.title, description: w.description || "", beforePhoto: w.beforePhoto || "", afterPhoto: w.afterPhoto || "", category: w.category || "", staffId: String(w.staffId) }); setShowForm(true); };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "beforePhoto" | "afterPhoto") => {
    const file = e.target.files?.[0];
    if (!file) return;
    try { const { url } = await api.upload(file); setForm({ ...form, [field]: url }); } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, staffId: Number(form.staffId), description: form.description || undefined, beforePhoto: form.beforePhoto || undefined, afterPhoto: form.afterPhoto || undefined, category: form.category || undefined };
    try {
      if (editing) await api.put(`/portfolio/${editing.id}`, data);
      else await api.post("/portfolio", data);
      setShowForm(false); load();
    } catch {}
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить работу?")) return;
    try { await api.delete(`/portfolio/${id}`); load(); } catch {}
  };

  if (loading) return <div className="text-gray-500">Загрузка...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Портфолио</h2>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-sm font-medium transition-colors">
          <Plus className="h-4 w-4" /> Добавить
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">{editing ? "Редактировать" : "Новая работа"}</h3>
            <button onClick={() => setShowForm(false)}><X className="h-5 w-5 text-gray-400" /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" placeholder="Название" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
            <input type="text" placeholder="Категория" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
            <select required value={form.staffId} onChange={(e) => setForm({ ...form, staffId: e.target.value })} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
              <option value="">Выберите мастера</option>
              {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <textarea placeholder="Описание" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm resize-none" rows={2} />
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Фото "До"</label>
              <input type="file" accept="image/*" onChange={(e) => handleUpload(e, "beforePhoto")} className="text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Фото "После"</label>
              <input type="file" accept="image/*" onChange={(e) => handleUpload(e, "afterPhoto")} className="text-sm" />
            </div>
            <button type="submit" className="sm:col-span-2 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-sm font-medium transition-colors">
              {editing ? "Сохранить" : "Создать"}
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {works.map((w) => (
          <div key={w.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            {w.afterPhoto && (
              <div className="aspect-video overflow-hidden">
                <img src={w.afterPhoto} alt={w.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{w.title}</h3>
                  <p className="text-xs text-pink-600 dark:text-pink-400">Мастер: {w.staff?.name}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(w)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(w.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
