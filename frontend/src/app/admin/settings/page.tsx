"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Settings } from "@/lib/types";
import { CheckCircle2, Loader2 } from "lucide-react";

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
    api
      .get<Settings>("/settings")
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  const inputCls =
    "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-forest transition-colors";

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Настройки</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Контактные данные и интеграции
        </p>
      </div>

      {success && (
        <div className="mb-4 max-w-xl flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Настройки сохранены
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="max-w-xl rounded-2xl border border-border bg-card p-6 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1.5">
            Название компании
          </label>
          <input
            type="text"
            value={form.companyName}
            onChange={(e) => setForm({ ...form, companyName: e.target.value })}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1.5">
            Основной телефон
          </label>
          <input
            type="tel"
            value={form.mainPhone}
            onChange={(e) => setForm({ ...form, mainPhone: e.target.value })}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1.5">
            Email
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1.5">
            ВКонтакте
          </label>
          <input
            type="url"
            value={form.vk}
            onChange={(e) => setForm({ ...form, vk: e.target.value })}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1.5">
            Instagram
          </label>
          <input
            type="url"
            value={form.instagram}
            onChange={(e) => setForm({ ...form, instagram: e.target.value })}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1.5">
            Telegram Chat ID
          </label>
          <input
            type="text"
            value={form.telegramChatId}
            onChange={(e) => setForm({ ...form, telegramChatId: e.target.value })}
            className={inputCls}
          />
        </div>
        <label className="flex items-center gap-3 cursor-pointer pt-2">
          <input
            type="checkbox"
            checked={form.smsEnabled}
            onChange={(e) => setForm({ ...form, smsEnabled: e.target.checked })}
            className="h-4 w-4 rounded border-border bg-background text-forest focus:ring-forest focus:ring-offset-0"
          />
          <span className="text-sm text-foreground">Включить SMS-уведомления</span>
        </label>

        <button
          type="submit"
          disabled={saving}
          className="group relative w-full sm:w-auto overflow-hidden rounded-lg bg-gradient-to-r from-emerald-700 via-emerald-800 to-emerald-900 px-6 py-2.5 text-sm font-semibold text-white shadow-lg ring-1 ring-emerald-500/30 transition-shadow hover:shadow-xl disabled:opacity-50 inline-flex items-center justify-center gap-2"
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
      </form>
    </div>
  );
}
