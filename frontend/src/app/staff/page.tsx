"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { api } from "@/lib/api";
import type { Staff } from "@/lib/types";

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Staff[]>("/staff")
      .then(setStaff)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">Наша команда</h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            Познакомьтесь с нашими специалистами
          </p>

          {loading ? (
            <div className="text-center text-gray-500">Загрузка...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {staff.map((member) => (
                <div key={member.id} className="group bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow">
                  {member.photo ? (
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={member.photo}
                        alt={member.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[4/3] bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/20 dark:to-rose-900/20 flex items-center justify-center">
                      <span className="text-5xl text-pink-300 dark:text-pink-700">{member.name[0]}</span>
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{member.name}</h3>
                    <p className="text-sm text-pink-600 dark:text-pink-400 mb-2">{member.role}</p>
                    {member.experience > 0 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Стаж: {member.experience} лет</p>
                    )}
                    {member.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">{member.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
