"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Staff } from "@/lib/types";
import { Plus, Pencil, Trash2, X } from "lucide-react";

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Staff | null>(null);
  const [form, setForm] = useState({ name: "", role: "", experience: 0, description: "", photo: "" });

  const loadStaff = () => {
    api.get<Staff[]>("/staff").then(setStaff).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { loadStaff(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", role: "", experience: 0, description: "", photo: "" });
    setShowForm(true);
  };

  const openEdit = (s: Staff) => {
    setEditing(s);
    setForm({ name: s.name, role: s.role, experience: s.experience, description: s.description || "", photo: s.photo || "" });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, photo: form.photo || undefined, description: form.description || undefined };
    try {
      if (editing) {
        await api.put(`/staff/${editing.id}`, data);
      } else {
        await api.post("/staff", data);
      }
      setShowForm(false);
      loadStaff();
    } catch {}
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить сотрудника?")) return;
    try { await api.delete(`/staff/${id}`); loadStaff(); } catch {}
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { url } = await api.upload(file);
      setForm({ ...form, photo: url });
    } catch {}
  };

  if (loading) return <div className="text-gray-500">Загрузка...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Сотрудники</h2>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-sm font-medium transition-colors">
          <Plus className="h-4 w-4" /> Добавить
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">{editing ? "Редактировать" : "Новый сотрудник"}</h3>
            <button onClick={() => setShowForm(false)}><X className="h-5 w-5 text-gray-400" /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" placeholder="Имя" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
            <input type="text" placeholder="Должность" required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
            <input type="number" placeholder="Стаж (лет)" min={0} value={form.experience} onChange={(e) => setForm({ ...form, experience: Number(e.target.value) })} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
            <input type="file" accept="image/*" onChange={handleUpload} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
            <textarea placeholder="Описание" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="sm:col-span-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm resize-none" rows={3} />
            <button type="submit" className="sm:col-span-2 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-sm font-medium transition-colors">
              {editing ? "Сохранить" : "Создать"}
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff.map((s) => (
          <div key={s.id} className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{s.name}</h3>
                <p className="text-sm text-pink-600 dark:text-pink-400">{s.role}</p>
                {s.experience > 0 && <p className="text-xs text-gray-500 mt-1">Стаж: {s.experience} лет</p>}
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(s)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => handleDelete(s.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
