"use client";

import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/", label: "Главная" },
  { href: "/services", label: "Услуги" },
  { href: "/staff", label: "Команда" },
  { href: "/portfolio", label: "Портфолио" },
  { href: "/reviews", label: "Отзывы" },
  { href: "/contacts", label: "Контакты" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-pink-600 dark:text-pink-400">
            Сакура
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <ThemeToggle />
          </nav>

          <button
            className="md:hidden p-2"
            onClick={() => setOpen(!open)}
            aria-label="Меню"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {open && (
          <nav className="md:hidden pb-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="px-3 pt-2">
              <ThemeToggle />
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
