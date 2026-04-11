"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { isAuthenticated, clearTokens } from "@/lib/api";
import { SSEToast } from "@/components/admin/SSEToast";
import {
  LayoutDashboard, Calendar, Flame, Star, Settings, LogOut, Menu, X,
} from "lucide-react";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Дашборд" },
  { href: "/admin/bookings", icon: Calendar, label: "Брони" },
  { href: "/admin/saunas", icon: Flame, label: "Сауны" },
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
    <div className="min-h-screen bg-background text-foreground">
      <SSEToast />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border transform transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          <Link href="/admin" className="flex items-center gap-2">
            <Image
              src="/logo_sakura_2.png"
              alt="Сакура"
              width={1200}
              height={400}
              className="h-9 w-auto"
            />
          </Link>
          <button
            className="lg:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-forest/15 text-forest"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Выйти
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 h-16 bg-background/80 backdrop-blur-md border-b border-border flex items-center px-4 sm:px-6">
          <button
            className="lg:hidden mr-4 text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold">
            {navItems.find((i) => i.href === pathname)?.label || "Админ-панель"}
          </h1>
        </header>

        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
