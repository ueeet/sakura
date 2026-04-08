"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Service } from "@/lib/types";
import { Plus, Pencil, Trash2, X } from "lucide-react";

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState({ name: "", description: "", price: 0, duration: 30, category: "" });

  const load = () => { api.get<Service[]>("/services").then(setServices).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm({ name: "", description: "", price: 0, duration: 30, category: "" }); setShowForm(true); };
  const openEdit = (s: Service) => { setEditing(s); setForm({ name: s.name, description: s.description || "", price: s.price, duration: s.duration, category: s.category || "" }); setShowForm(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, description: form.description || undefined, category: form.category || undefined };
    try {
      if (editing) await api.put(`/services/${editing.id}`, data);
      else await api.post("/services", data);
      setShowForm(false); load();
    } catch {}
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить услугу?")) return;
    try { await api.delete(`/services/${id}`); load(); } catch {}
  };

  if (loading) return <div className="text-gray-500">Загрузка...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Услуги</h2>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-sm font-medium transition-colors">
          <Plus className="h-4 w-4" /> Добавить
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">{editing ? "Редактировать" : "Новая услуга"}</h3>
            <button onClick={() => setShowForm(false)}><X className="h-5 w-5 text-gray-400" /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" placeholder="Название" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
            <input type="text" placeholder="Категория" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
            <input type="number" placeholder="Цена (руб.)" required min={0} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
            <input type="number" placeholder="Длительность (мин.)" min={1} value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
            <textarea placeholder="Описание" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="sm:col-span-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm resize-none" rows={3} />
            <button type="submit" className="sm:col-span-2 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-sm font-medium transition-colors">
              {editing ? "Сохранить" : "Создать"}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="px-4 py-3 text-left font-medium text-gray-500">Название</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Категория</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Цена</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Длительность</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Действия</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{s.name}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{s.category || "—"}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{s.price} руб.</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{s.duration} мин.</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(s)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(s.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
