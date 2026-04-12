"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type MegaMenuItem = {
  id: number;
  label: string;
  subMenus?: {
    title: string;
    items: {
      label: string;
      description: string;
      icon?: React.ElementType;
      link?: string;
    }[];
  }[];
  link?: string;
};

export interface MegaMenuProps extends React.HTMLAttributes<HTMLUListElement> {
  items: MegaMenuItem[];
  className?: string;
}

const MegaMenu = React.forwardRef<HTMLUListElement, MegaMenuProps>(
  ({ items, className, ...props }, ref) => {
    const [openMenu, setOpenMenu] = React.useState<string | null>(null);
    const [isHover, setIsHover] = React.useState<number | null>(null);
    const pathname = usePathname();

    const handleHover = (menuLabel: string | null) => {
      setOpenMenu(menuLabel);
    };

    /** Если уже на главной и ссылка — якорь или "/" → плавный скролл. */
    const handleNavClick = (
      e: React.MouseEvent,
      link: string,
    ) => {
      if (link === "/" && pathname === "/") {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      // /#about, /#promotions, /#contacts — скролл к секции если на главной
      if (link.startsWith("/#") && pathname === "/") {
        e.preventDefault();
        const id = link.slice(2);
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }
    };

    return (
      <ul
        ref={ref}
        className={`relative flex items-center space-x-0 ${className || ""}`}
        {...props}
      >
        {items.map((navItem) => (
          <li
            key={navItem.label}
            className="relative"
            onMouseEnter={() => handleHover(navItem.label)}
            onMouseLeave={() => handleHover(null)}
          >
            {navItem.link && !navItem.subMenus ? (
              <Link
                href={navItem.link}
                onClick={(e) => handleNavClick(e, navItem.link!)}
                className="relative flex cursor-pointer items-center justify-center gap-1 py-1.5 px-4 text-[17px] text-foreground/60 transition-colors duration-300 hover:text-foreground group"
                onMouseEnter={() => setIsHover(navItem.id)}
                onMouseLeave={() => setIsHover(null)}
              >
                <span>{navItem.label}</span>
                {(isHover === navItem.id) && (
                  <motion.div
                    layoutId="hover-bg"
                    className="absolute inset-0 size-full bg-foreground/5"
                    style={{ borderRadius: 99 }}
                  />
                )}
              </Link>
            ) : (
              <button
                className="relative flex cursor-pointer items-center justify-center gap-1 py-1.5 px-4 text-[17px] text-foreground/60 transition-colors duration-300 hover:text-foreground group"
                onMouseEnter={() => setIsHover(navItem.id)}
                onMouseLeave={() => setIsHover(null)}
              >
                <span>{navItem.label}</span>
                {navItem.subMenus && (
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-300 group-hover:rotate-180 ${
                      openMenu === navItem.label ? "rotate-180" : ""
                    }`}
                  />
                )}
                {(isHover === navItem.id || openMenu === navItem.label) && (
                  <motion.div
                    layoutId="hover-bg"
                    className="absolute inset-0 size-full bg-foreground/5"
                    style={{ borderRadius: 99 }}
                  />
                )}
              </button>
            )}

            <AnimatePresence>
              {openMenu === navItem.label && navItem.subMenus && (
                <div className="absolute left-1/2 top-full z-10 w-auto -translate-x-1/2 pt-2">
                  <motion.div
                    className="w-max border border-border bg-card p-4 shadow-lg"
                    style={{
                      borderRadius: 16,
                      transformOrigin: "top center",
                      willChange: "transform, opacity",
                    }}
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                  >
                    <div className="flex w-fit shrink-0 space-x-9 overflow-hidden">
                      {navItem.subMenus.map((sub) => (
                        <div className="w-full" key={sub.title}>
                          {sub.title && (
                            <h3 className="mb-4 text-sm font-medium capitalize text-muted-foreground">
                              {sub.title}
                            </h3>
                          )}
                          <ul className="flex gap-8">
                            {sub.items.map((item) => {
                              const Icon = item.icon;
                              return (
                                <li key={item.label}>
                                  <Link
                                    href={item.link || "#"}
                                    className="flex items-start space-x-3 group"
                                  >
                                    {Icon && (
                                      <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border text-foreground transition-colors duration-300 group-hover:bg-forest group-hover:text-white">
                                        <Icon className="h-5 w-5 flex-none" />
                                      </div>
                                    )}
                                    <div className="w-max leading-5">
                                      <p className="shrink-0 text-sm font-medium text-foreground transition-colors duration-300 group-hover:text-forest">
                                        {item.label}
                                      </p>
                                      <p className="shrink-0 text-xs text-muted-foreground">
                                        {item.description}
                                      </p>
                                    </div>
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </li>
        ))}
      </ul>
    );
  }
);

MegaMenu.displayName = "MegaMenu";

export default MegaMenu;
