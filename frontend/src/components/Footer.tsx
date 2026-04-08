import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold text-pink-600 dark:text-pink-400 mb-4">Сакура</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Профессиональные услуги для ваших потребностей. Качество и внимание к каждому клиенту.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Навигация</h4>
            <ul className="space-y-2">
              {[
                { href: "/services", label: "Услуги" },
                { href: "/staff", label: "Команда" },
                { href: "/portfolio", label: "Портфолио" },
                { href: "/reviews", label: "Отзывы" },
                { href: "/contacts", label: "Контакты" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Правовая информация</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-sm text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                  Политика конфиденциальности
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                  Пользовательское соглашение
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500 dark:text-gray-500">
          &copy; {new Date().getFullYear()} Сакура. Все права защищены.
        </div>
      </div>
    </footer>
  );
}
