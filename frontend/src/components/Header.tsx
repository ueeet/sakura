"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import MegaMenu, { type MegaMenuItem } from "@/components/ui/mega-menu";

const navLinks = [
  { href: "/", label: "Главная" },
  { href: "/complex-9", label: "9 Комплекс" },
  { href: "/complex-50", label: "50 Комплекс" },
  { href: "/#about", label: "О Сакуре" },
  { href: "/#promotions", label: "Акции" },
  { href: "/#contacts", label: "Контакты" },
  { href: "/#reviews", label: "Отзывы" },
];

const megaMenuItems: MegaMenuItem[] = [
  { id: 1, label: "Главная", link: "/" },
  {
    id: 2,
    label: "Сауны",
    subMenus: [
      {
        title: "",
        items: [
          {
            label: "9 Комплекс",
            description: "пр. Мира, д. 9/04А",
            link: "/complex-9",
          },
          {
            label: "50 Комплекс",
            description: "ул. Нижняя Боровецкая, 20",
            link: "/complex-50",
          },
        ],
      },
    ],
  },
  { id: 3, label: "О Сакуре", link: "/#about" },
  { id: 4, label: "Акции", link: "/#promotions" },
  { id: 5, label: "Контакты", link: "/#contacts" },
  { id: 6, label: "Отзывы", link: "/#reviews" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("#")) return false;
    return pathname.startsWith(href);
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md transition-shadow duration-300 ${
        scrolled ? "shadow-md shadow-wood-dark/5" : ""
      }`}
    >
      <div className="mx-auto max-w-[1536px] px-6 md:px-12 lg:px-16">
        <div className="flex h-[70px] items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            onClick={(e) => {
              if (pathname === "/") {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className="flex items-center transition-opacity hover:opacity-80"
            aria-label="Сакура — на главную"
          >
            <Image
              src="/logo_sakura_2.png"
              alt="Сакура"
              width={1200}
              height={400}
              priority
              className="h-11 w-auto md:h-[52px]"
            />
          </Link>

          {/* Desktop navigation — MegaMenu */}
          <nav className="hidden items-center gap-1 md:flex">
            <MegaMenu
              items={megaMenuItems}
              className=""
            />
          </nav>

          {/* Mobile controls */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Открыть меню"
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen ? (
                  <motion.span
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-6 w-6" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-6 w-6" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden border-t border-border md:hidden"
          >
            <div className="mx-auto max-w-[1536px] space-y-1 px-6 pb-4 pt-2">
              {navLinks.map((link, index) => {
                const active = isActive(link.href);
                return (
                  <motion.div
                    key={link.href}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{
                      delay: index * 0.05,
                      duration: 0.25,
                    }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        active
                          ? "bg-forest/10 text-forest"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
