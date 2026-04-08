"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { Staff, Service } from "@/lib/types";

export function BookingForm() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState({
    clientName: "",
    phone: "",
    date: "",
    time: "",
    comment: "",
    staffId: "",
    serviceId: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get<Staff[]>("/staff").then(setStaff).catch(() => {});
    api.get<Service[]>("/services").then(setServices).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await api.post("/bookings", {
        ...form,
        staffId: Number(form.staffId),
        serviceId: Number(form.serviceId),
      });
      setSuccess(true);
      setForm({ clientName: "", phone: "", date: "", time: "", comment: "", staffId: "", serviceId: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка отправки");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
          Записаться онлайн
        </h2>

        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl text-center">
            Заявка отправлена! Мы свяжемся с вами для подтверждения.
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Ваше имя"
              required
              value={form.clientName}
              onChange={(e) => setForm({ ...form, clientName: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
            />
            <input
              type="tel"
              placeholder="Телефон"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
            />
            <input
              type="time"
              required
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <select
              required
              value={form.staffId}
              onChange={(e) => setForm({ ...form, staffId: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
            >
              <option value="">Выберите специалиста</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <select
              required
              value={form.serviceId}
              onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
            >
              <option value="">Выберите услугу</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.name} — {s.price} руб.</option>
              ))}
            </select>
          </div>

          <textarea
            placeholder="Комментарий (необязательно)"
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition resize-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white rounded-xl font-medium transition-colors shadow-lg shadow-pink-500/25"
          >
            {loading ? "Отправка..." : "Записаться"}
          </button>
        </form>
      </div>
    </section>
  );
}
