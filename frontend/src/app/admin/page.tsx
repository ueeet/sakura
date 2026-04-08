"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { onSSE } from "@/lib/sse";
import type { Stats } from "@/lib/types";
import { Calendar, Users, Briefcase, Image, Star } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  const loadStats = () => {
    api.get<Stats>("/stats").then(setStats).catch(() => {});
  };

  useEffect(() => {
    loadStats();
    return onSSE(loadStats);
  }, []);

  if (!stats) return <div className="text-gray-500">Загрузка...</div>;

  const cards = [
    { label: "Новые записи", value: stats.bookings.new, icon: Calendar, color: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20" },
    { label: "Подтверждённые", value: stats.bookings.confirmed, icon: Calendar, color: "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20" },
    { label: "Всего записей", value: stats.bookings.total, icon: Calendar, color: "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-800" },
    { label: "Сотрудники", value: stats.staff, icon: Users, color: "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20" },
    { label: "Услуги", value: stats.services, icon: Briefcase, color: "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20" },
    { label: "Портфолио", value: stats.portfolio, icon: Image, color: "text-pink-600 bg-pink-50 dark:text-pink-400 dark:bg-pink-900/20" },
    { label: "Отзывы", value: stats.reviews.total, icon: Star, color: "text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20" },
    { label: "Ожидают модерации", value: stats.reviews.pending, icon: Star, color: "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Обзор</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${card.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">{card.label}</span>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{card.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
