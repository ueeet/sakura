"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { onSSE } from "@/lib/sse";
import type { Stats } from "@/lib/types";
import { Calendar, Building2, Flame, Tag, Star, Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  const loadStats = () => {
    api.get<Stats>("/stats").then(setStats).catch(() => {});
  };

  useEffect(() => {
    loadStats();
    return onSSE(loadStats);
  }, []);

  if (!stats) {
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
      icon: Calendar,
      tone: "text-muted-foreground bg-muted",
    },
    {
      label: "Филиалы",
      value: stats.branches,
      icon: Building2,
      tone: "text-purple-400 bg-purple-500/10",
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
    {
      label: "Отзывы",
      value: stats.reviews.total,
      icon: Star,
      tone: "text-yellow-400 bg-yellow-500/10",
    },
    {
      label: "Ожидают модерации",
      value: stats.reviews.pending,
      icon: Star,
      tone: "text-red-400 bg-red-500/10",
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Обзор</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Сводка по бронированиям, саунам и отзывам
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              style={{ willChange: "transform, opacity" }}
              className="rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-lg"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${card.tone}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-sm text-muted-foreground">
                  {card.label}
                </span>
              </div>
              <p className="text-3xl font-bold text-foreground">{card.value}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
