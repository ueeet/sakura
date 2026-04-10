"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Settings } from "@/lib/types";

export default function AdminSettingsPage() {
  const [, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    companyName: "",
    mainPhone: "",
    email: "",
    vk: "",
    instagram: "",
    telegramChatId: "",
    smsEnabled: false,
  });

  useEffect(() => {
    api.get<Settings>("/settings")
      .then((s) => {
        setSettings(s);
        setForm({
          companyName: s.companyName,
          mainPhone: s.mainPhone,
          email: s.email,
          vk: s.vk,
          instagram: s.instagram,
          telegramChatId: s.telegramChatId,
          smsEnabled: s.smsEnabled,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      await api.put("/settings", form);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {}
    setSaving(false);
  };

  if (loading) return <div className="text-gray-500">Загрузка...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Настройки</h2>

      {success && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl text-sm text-center">
          Настройки сохранены
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Название компании</label>
          <input type="text" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Основной телефон</label>
          <input type="tel" value={form.mainPhone} onChange={(e) => setForm({ ...form, mainPhone: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ВКонтакте</label>
          <input type="url" value={form.vk} onChange={(e) => setForm({ ...form, vk: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instagram</label>
          <input type="url" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telegram Chat ID</label>
          <input type="text" value={form.telegramChatId} onChange={(e) => setForm({ ...form, telegramChatId: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="smsEnabled" checked={form.smsEnabled} onChange={(e) => setForm({ ...form, smsEnabled: e.target.checked })} className="rounded border-gray-300" />
          <label htmlFor="smsEnabled" className="text-sm text-gray-700 dark:text-gray-300">Включить SMS-уведомления</label>
        </div>
        <button type="submit" disabled={saving} className="px-6 py-2 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors">
          {saving ? "Сохранение..." : "Сохранить"}
        </button>
      </form>
    </div>
  );
}
