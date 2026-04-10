"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { isAuthenticated, clearTokens } from "@/lib/api";
import { SSEToast } from "@/components/admin/SSEToast";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  LayoutDashboard, Calendar, Star, Settings, LogOut, Menu, X,
} from "lucide-react";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Дашборд" },
  { href: "/admin/bookings", icon: Calendar, label: "Брони" },
  { href: "/admin/reviews", icon: Star, label: "Отзывы" },
  { href: "/admin/settings", icon: Settings, label: "Настройки" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (pathname !== "/admin/login" && !isAuthenticated()) {
      router.push("/admin/login");
    }
  }, [pathname, router]);

  if (!mounted) return null;
  if (pathname === "/admin/login") return <>{children}</>;

  const handleLogout = () => {
    clearTokens();
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <SSEToast />

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
          <Link href="/admin" className="text-xl font-bold text-pink-600 dark:text-pink-400">
            Сакура
          </Link>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Выйти
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 flex items-center px-4">
          <button className="lg:hidden mr-4" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            {navItems.find((i) => i.href === pathname)?.label || "Админ-панель"}
          </h1>
        </header>

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
