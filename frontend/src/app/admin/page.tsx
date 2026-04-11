"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { api } from "@/lib/api";
import { onSSE } from "@/lib/sse";
import type { Stats, Booking, Sauna, Branch } from "@/lib/types";
import {
  Calendar,
  Building2,
  Flame,
  Tag,
  Loader2,
  TrendingUp,
  DollarSign,
  Users,
} from "lucide-react";

const FOREST = "#16a34a";
const FOREST_LIGHT = "#22c55e";
const COLORS = ["#16a34a", "#f59e0b", "#3b82f6", "#ec4899", "#8b5cf6", "#ef4444"];

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Ожидает оплаты",
  new: "Новые",
  confirmed: "Подтверждённые",
  cancelled: "Отменённые",
  completed: "Завершённые",
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function AdminStatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [saunas, setSaunas] = useState<Sauna[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAll = () => {
    // Каждый запрос обрабатываем независимо — если один упадёт,
    // остальные данные всё равно отобразятся
    Promise.allSettled([
      api.get<Stats>("/stats"),
      api.get<Booking[]>("/bookings"),
      api.get<Sauna[]>("/saunas"),
      api.get<Branch[]>("/branches"),
    ]).then(([s, b, sa, br]) => {
      if (s.status === "fulfilled") setStats(s.value);
      if (b.status === "fulfilled") setBookings(b.value);
      if (sa.status === "fulfilled") setSaunas(sa.value);
      if (br.status === "fulfilled") setBranches(br.value);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadAll();
    return onSSE(loadAll);
  }, []);

  // ========== Агрегации ==========

  // Брони по статусам
  const bookingsByStatus = useMemo(() => {
    const map: Record<string, number> = {};
    bookings.forEach((b) => {
      map[b.status] = (map[b.status] || 0) + 1;
    });
    return Object.entries(map).map(([key, value]) => ({
      name: STATUS_LABELS[key] || key,
      value,
      key,
    }));
  }, [bookings]);

  // 3. Брони по филиалам
  const bookingsByBranch = useMemo(() => {
    const map: Record<number, { name: string; count: number; revenue: number }> = {};
    branches.forEach((br) => {
      map[br.id] = { name: br.name, count: 0, revenue: 0 };
    });
    bookings.forEach((b) => {
      if (map[b.branchId]) {
        map[b.branchId].count++;
        map[b.branchId].revenue += b.totalPrice || 0;
      }
    });
    return Object.values(map);
  }, [bookings, branches]);

  // 4. Топ-5 саун по броням
  const topSaunas = useMemo(() => {
    const map: Record<number, { name: string; count: number }> = {};
    saunas.forEach((s) => {
      map[s.id] = { name: s.name, count: 0 };
    });
    bookings.forEach((b) => {
      if (map[b.saunaId]) map[b.saunaId].count++;
    });
    return Object.values(map)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [bookings, saunas]);

  // 5. Брони по часам дня
  const bookingsByHour = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, h) => ({ hour: pad(h), count: 0 }));
    bookings.forEach((b) => {
      const h = new Date(b.startAt).getHours();
      hours[h].count++;
    });
    return hours;
  }, [bookings]);

  // 6. Общий доход
  const totalRevenue = useMemo(
    () => bookings.reduce((sum, b) => sum + (b.paidAmount || 0), 0),
    [bookings],
  );

  // 7. Средний чек
  const avgCheck = useMemo(() => {
    const paid = bookings.filter((b) => (b.totalPrice || 0) > 0);
    if (paid.length === 0) return 0;
    return Math.round(
      paid.reduce((sum, b) => sum + (b.totalPrice || 0), 0) / paid.length,
    );
  }, [bookings]);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  const cards = [
    {
      label: "Новые брони",
      value: stats.bookings.new,
      icon: Calendar,
      tone: "text-blue-400 bg-blue-500/10",
    },
    {
      label: "Подтверждённые",
      value: stats.bookings.confirmed,
      icon: Calendar,
      tone: "text-emerald-400 bg-emerald-500/10",
    },
    {
      label: "Всего броней",
      value: stats.bookings.total,
      icon: TrendingUp,
      tone: "text-muted-foreground bg-muted",
    },
    {
      label: "Выручка",
      value: `${totalRevenue.toLocaleString("ru-RU")}₽`,
      icon: DollarSign,
      tone: "text-emerald-400 bg-emerald-500/10",
    },
    {
      label: "Средний чек",
      value: `${avgCheck.toLocaleString("ru-RU")}₽`,
      icon: Users,
      tone: "text-purple-400 bg-purple-500/10",
    },
    {
      label: "Филиалы",
      value: stats.branches,
      icon: Building2,
      tone: "text-blue-400 bg-blue-500/10",
    },
    {
      label: "Сауны",
      value: stats.saunas,
      icon: Flame,
      tone: "text-orange-400 bg-orange-500/10",
    },
    {
      label: "Акции",
      value: stats.promotions,
      icon: Tag,
      tone: "text-pink-400 bg-pink-500/10",
    },
  ];

  // Custom tooltip
  const tooltipContentStyle = {
    backgroundColor: "hsl(20 12% 12%)",
    border: "1px solid hsl(30 8% 25%)",
    borderRadius: "8px",
    padding: "8px 12px",
  };
  const tooltipLabelStyle = { color: "hsl(40 8% 70%)", fontSize: 12 };
  const tooltipItemStyle = { color: "hsl(40 12% 92%)", fontSize: 13 };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Статистика</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Показатели бизнеса в реальном времени
        </p>
      </div>

      {/* KPI карточки */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              style={{ willChange: "transform, opacity" }}
              className="rounded-2xl border border-border bg-card p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg ${card.tone}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-xs text-muted-foreground">{card.label}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Топ-5 популярных саун — full width */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-4">
          <h3 className="text-base font-semibold">Топ-5 популярных саун</h3>
          <p className="text-xs text-muted-foreground">По количеству броней</p>
        </div>
        {topSaunas.length === 0 || topSaunas[0].count === 0 ? (
          <div className="flex items-center justify-center h-[240px] text-sm text-muted-foreground">
            Нет данных
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={topSaunas} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(30 8% 22%)" horizontal={false} />
              <XAxis
                type="number"
                stroke="hsl(40 8% 60%)"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="hsl(40 8% 60%)"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={140}
              />
              <Tooltip
                contentStyle={tooltipContentStyle}
                labelStyle={tooltipLabelStyle}
                itemStyle={tooltipItemStyle}
                cursor={{ fill: "hsl(30 8% 18%)" }}
              />
              <Bar dataKey="count" fill={FOREST_LIGHT} radius={[0, 6, 6, 0]} name="Брони" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Брони по филиалам + Брони по статусам */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4">
            <h3 className="text-base font-semibold">Брони по филиалам</h3>
            <p className="text-xs text-muted-foreground">Загрузка комплексов</p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={bookingsByBranch}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(30 8% 22%)" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="hsl(40 8% 60%)"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(40 8% 60%)"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={tooltipContentStyle}
                labelStyle={tooltipLabelStyle}
                itemStyle={tooltipItemStyle}
                cursor={{ fill: "hsl(30 8% 18%)" }}
              />
              <Bar dataKey="count" fill={FOREST} radius={[6, 6, 0, 0]} name="Брони" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4">
            <h3 className="text-base font-semibold">Брони по статусам</h3>
            <p className="text-xs text-muted-foreground">
              Распределение всех записей
            </p>
          </div>
          {bookingsByStatus.length === 0 ? (
            <div className="flex items-center justify-center h-[240px] text-sm text-muted-foreground">
              Нет данных
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={bookingsByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="hsl(20 12% 12%)"
                  strokeWidth={2}
                >
                  {bookingsByStatus.map((entry, idx) => (
                    <Cell key={entry.key} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipContentStyle}
                  labelStyle={tooltipLabelStyle}
                  itemStyle={tooltipItemStyle}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12, color: "hsl(40 8% 70%)" }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Брони по часам дня */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-4">
          <h3 className="text-base font-semibold">Распределение по часам дня</h3>
          <p className="text-xs text-muted-foreground">Когда чаще бронируют</p>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={bookingsByHour}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(30 8% 22%)" vertical={false} />
            <XAxis
              dataKey="hour"
              stroke="hsl(40 8% 60%)"
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(40 8% 60%)"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={tooltipContentStyle}
              labelStyle={tooltipLabelStyle}
              itemStyle={tooltipItemStyle}
              cursor={{ fill: "hsl(30 8% 18%)" }}
              labelFormatter={(v) => `${v}:00`}
            />
            <Bar dataKey="count" fill={FOREST} radius={[3, 3, 0, 0]} name="Брони" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Reviews summary */}
      <div className="rounded-2xl border border-border bg-card p-5 flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-yellow-500/10 text-yellow-400">
            <Star className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Всего отзывов</div>
            <div className="text-2xl font-bold">{stats.reviews.total}</div>
          </div>
        </div>
        <div className="h-8 w-px bg-border" />
        <div>
          <div className="text-xs text-muted-foreground">Ожидают модерации</div>
          <div className="text-2xl font-bold text-amber-400">{stats.reviews.pending}</div>
        </div>
      </div>
    </div>
  );
}
