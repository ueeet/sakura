"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { onSSE } from "@/lib/sse";
import type { Booking, Branch, Sauna } from "@/lib/types";
import { DateTimePicker } from "@/components/admin/DateTimePicker";
import {
  Check,
  X,
  Trash2,
  Loader2,
  Plus,
  Pencil,
  Search,
  Filter,
  Archive,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const statusLabels: Record<string, { label: string; class: string }> = {
  pending_payment: {
    label: "Ожидает оплаты",
    class: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  },
  new: {
    label: "Новая",
    class: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
  },
  confirmed: {
    label: "Подтверждена",
    class: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  },
  cancelled: {
    label: "Отменена",
    class: "bg-red-500/15 text-red-400 border border-red-500/30",
  },
  completed: {
    label: "Завершена",
    class: "bg-muted text-muted-foreground border border-border",
  },
};

const paymentStatusLabels: Record<string, { label: string; class: string }> = {
  pending: { label: "—", class: "text-muted-foreground" },
  deposit_paid: { label: "Депозит", class: "text-blue-400" },
  fully_paid: { label: "Полная", class: "text-emerald-400" },
  refunded: { label: "Возврат", class: "text-red-400" },
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", {
    timeZone: "Europe/Moscow",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatHours(start: string, end: string) {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.round(ms / 3_600_000);
}

type Tab = "active" | "archive";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [saunas, setSaunas] = useState<Sauna[]>([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [tab, setTab] = useState<Tab>("active");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [branchFilter, setBranchFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  // Modal state
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Booking | null>(null);

  const loadBookings = () => {
    api
      .get<Booking[]>("/bookings")
      .then(setBookings)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // brachs/saunas — для селектов в форме
    Promise.all([
      api.get<Branch[]>("/branches").catch(() => []),
      api.get<Sauna[]>("/saunas").catch(() => []),
    ]).then(([b, s]) => {
      setBranches(b);
      setSaunas(s);
    });
    loadBookings();
    return onSSE(loadBookings);
  }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.put(`/bookings/${id}`, { status });
      loadBookings();
    } catch {}
  };

  const deleteBooking = async (id: number) => {
    if (!confirm("Удалить бронь? Это действие необратимо.")) return;
    try {
      await api.delete(`/bookings/${id}`);
      loadBookings();
    } catch {}
  };

  // Разделение по вкладкам + фильтры
  const filtered = useMemo(() => {
    const archived = ["cancelled", "completed"];
    let list = bookings.filter((b) =>
      tab === "archive" ? archived.includes(b.status) : !archived.includes(b.status),
    );

    if (statusFilter !== "all") list = list.filter((b) => b.status === statusFilter);
    if (branchFilter !== "all") list = list.filter((b) => String(b.branchId) === branchFilter);

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (b) =>
          b.clientName.toLowerCase().includes(q) ||
          b.phone.toLowerCase().includes(q),
      );
    }

    return list;
  }, [bookings, tab, statusFilter, branchFilter, search]);

  const activeCount = bookings.filter((b) => !["cancelled", "completed"].includes(b.status)).length;
  const archiveCount = bookings.filter((b) => ["cancelled", "completed"].includes(b.status)).length;

  // Доступные фильтры по статусу в зависимости от вкладки
  const statusOptions = tab === "archive"
    ? [
        { key: "all", label: "Все" },
        { key: "cancelled", label: "Отменены" },
        { key: "completed", label: "Завершены" },
      ]
    : [
        { key: "all", label: "Все" },
        { key: "new", label: "Новые" },
        { key: "confirmed", label: "Подтверждены" },
      ];

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
          <h2 className="text-2xl font-bold text-foreground">Брони</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Активных: {activeCount} · В архиве: {archiveCount}
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setEditing(null); setEditorOpen(true); }}
          className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-emerald-700 via-emerald-800 to-emerald-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg ring-1 ring-emerald-500/30 transition-shadow hover:shadow-xl flex items-center gap-2"
        >
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          <Plus className="h-4 w-4" />
          Новая бронь
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-1 border-b border-border">
        <button
          onClick={() => { setTab("active"); setStatusFilter("all"); }}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            tab === "active"
              ? "border-forest text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Активные ({activeCount})
        </button>
        <button
          onClick={() => { setTab("archive"); setStatusFilter("all"); }}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${
            tab === "archive"
              ? "border-forest text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Archive className="h-4 w-4" />
          Архив ({archiveCount})
        </button>
      </div>

      {/* Filters row */}
      <div className="mb-5 flex flex-wrap gap-2 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Поиск по имени или телефону..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-forest"
          />
        </div>

        {/* Status filter */}
        <div className="flex gap-1.5 flex-wrap">
          {statusOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setStatusFilter(opt.key)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                statusFilter === opt.key
                  ? "bg-forest/15 text-forest border border-forest/30"
                  : "border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Filter className="h-3 w-3" />
              {opt.label}
            </button>
          ))}
        </div>

        {/* Branch filter */}
        <select
          value={branchFilter}
          onChange={(e) => setBranchFilter(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-foreground outline-none focus:border-forest"
        >
          <option value="all">Все филиалы</option>
          {branches.map((br) => (
            <option key={br.id} value={br.id}>{br.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Клиент</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Телефон</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Начало</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Конец</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Часов</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Гостей</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Филиал</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Сауна</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Сумма</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Оплата</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Статус</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr
                  key={b.id}
                  className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors cursor-pointer"
                  onClick={() => { setEditing(b); setEditorOpen(true); }}
                >
                  <td className="px-4 py-3 text-foreground font-medium">{b.clientName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{b.phone}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDateTime(b.startAt)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDateTime(b.endAt)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatHours(b.startAt, b.endAt)} ч</td>
                  <td className="px-4 py-3 text-muted-foreground">{b.guests}</td>
                  <td className="px-4 py-3 text-muted-foreground">{b.branch?.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{b.sauna?.name}</td>
                  <td className="px-4 py-3 text-foreground font-semibold">
                    {b.totalPrice ? `${b.totalPrice}₽` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium ${
                        paymentStatusLabels[b.paymentStatus]?.class ||
                        "text-muted-foreground"
                      }`}
                    >
                      {paymentStatusLabels[b.paymentStatus]?.label || "—"}
                      {b.paidAmount > 0 && ` (${b.paidAmount}₽)`}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        statusLabels[b.status]?.class
                      }`}
                    >
                      {statusLabels[b.status]?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-1">
                      {b.status === "new" && (
                        <>
                          <button
                            onClick={() => updateStatus(b.id, "confirmed")}
                            className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                            title="Подтвердить"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => updateStatus(b.id, "cancelled")}
                            className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Отклонить"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => { setEditing(b); setEditorOpen(true); }}
                        className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                        title="Редактировать"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteBooking(b.id)}
                        className="p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Удалить"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={12} className="px-4 py-12 text-center text-muted-foreground">
                    {tab === "archive" ? "В архиве пусто" : "Активных броней нет"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <BookingEditor
        open={editorOpen}
        booking={editing}
        branches={branches}
        saunas={saunas}
        onClose={() => setEditorOpen(false)}
        onSaved={loadBookings}
      />
    </div>
  );
}

/* ───────── Editor modal ───────── */

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  // форматируем как YYYY-MM-DDTHH:MM в МСК
  const msk = new Date(d.getTime() + (d.getTimezoneOffset() + 180) * 60_000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${msk.getFullYear()}-${pad(msk.getMonth() + 1)}-${pad(msk.getDate())}T${pad(msk.getHours())}:${pad(msk.getMinutes())}`;
}

function fromLocalInput(v: string): string {
  // v приходит как YYYY-MM-DDTHH:MM (без TZ) — считаем это МСК временем
  if (!v) return "";
  return v + ":00.000+03:00";
}

interface EditorProps {
  open: boolean;
  booking: Booking | null;
  branches: Branch[];
  saunas: Sauna[];
  onClose: () => void;
  onSaved: () => void;
}

function BookingEditor({ open, booking, branches, saunas, onClose, onSaved }: EditorProps) {
  const isEdit = !!booking;
  const [form, setForm] = useState(() => emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const firstRender = useRef(true);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setSuccess(false);
    if (booking) {
      setForm({
        clientName: booking.clientName,
        phone: booking.phone,
        branchId: String(booking.branchId),
        saunaId: String(booking.saunaId),
        startAt: toLocalInput(booking.startAt),
        endAt: toLocalInput(booking.endAt),
        guests: String(booking.guests),
        totalPrice: booking.totalPrice ? String(booking.totalPrice) : "",
        comment: booking.comment ?? "",
        status: booking.status,
      });
    } else {
      setForm(emptyForm());
    }
    firstRender.current = false;
  }, [open, booking]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Фильтруем сауны по выбранному филиалу
  const availableSaunas = useMemo(
    () => saunas.filter((s) => !form.branchId || String(s.branchId) === form.branchId),
    [saunas, form.branchId],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload: Record<string, unknown> = {
      clientName: form.clientName.trim(),
      phone: form.phone.trim(),
      branchId: Number(form.branchId),
      saunaId: Number(form.saunaId),
      startAt: fromLocalInput(form.startAt),
      endAt: fromLocalInput(form.endAt),
      guests: Number(form.guests) || 2,
      comment: form.comment.trim() || undefined,
    };
    if (form.totalPrice) payload.totalPrice = Number(form.totalPrice);

    try {
      if (isEdit && booking) {
        // В режиме редактирования админ может менять любые поля
        const editPayload: Record<string, unknown> = {
          ...payload,
          status: form.status,
        };
        await api.put(`/bookings/${booking.id}`, editPayload);
      } else {
        await api.post("/bookings/admin", payload);
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
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-card/95 backdrop-blur p-5">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {isEdit ? `Бронь #${booking?.id}` : "Новая бронь"}
                </p>
                <h3 className="mt-0.5 text-xl font-semibold leading-tight">
                  {isEdit ? "Редактировать" : "Добавить бронь"}
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Имя клиента</label>
                  <input
                    type="text"
                    required
                    value={form.clientName}
                    onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-forest"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Телефон</label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+7..."
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-forest"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Филиал</label>
                  <select
                    required
                    value={form.branchId}
                    onChange={(e) => setForm({ ...form, branchId: e.target.value, saunaId: "" })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-forest"
                  >
                    <option value="">—</option>
                    {branches.map((br) => (
                      <option key={br.id} value={br.id}>{br.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Сауна</label>
                  <select
                    required
                    value={form.saunaId}
                    onChange={(e) => setForm({ ...form, saunaId: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-forest"
                  >
                    <option value="">—</option>
                    {availableSaunas.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Дата и время
                </label>
                <BookingTimeRange
                  startAt={form.startAt}
                  endAt={form.endAt}
                  onChange={(startAt, endAt) => setForm({ ...form, startAt, endAt })}
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Гостей</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={form.guests}
                    onChange={(e) => setForm({ ...form, guests: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-forest"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Сумма (₽)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.totalPrice}
                    onChange={(e) => setForm({ ...form, totalPrice: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-forest"
                  />
                </div>
                {isEdit && (
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Статус</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-forest"
                    >
                      <option value="new">Новая</option>
                      <option value="confirmed">Подтверждена</option>
                      <option value="cancelled">Отменена</option>
                      <option value="completed">Завершена</option>
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Комментарий</label>
                <textarea
                  rows={3}
                  value={form.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-forest resize-none"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  {isEdit ? "Сохранено!" : "Бронь создана!"}
                </div>
              )}
            </form>

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
                disabled={saving}
                className="flex-[2] rounded-lg bg-forest text-white py-2.5 text-sm font-semibold hover:bg-forest/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Сохранение...
                  </>
                ) : isEdit ? (
                  "Сохранить"
                ) : (
                  "Создать бронь"
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function emptyForm() {
  return {
    clientName: "",
    phone: "",
    branchId: "",
    saunaId: "",
    startAt: "",
    endAt: "",
    guests: "2",
    totalPrice: "",
    comment: "",
    status: "new",
  };
}
