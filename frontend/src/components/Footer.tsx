"use client";

import Image from "next/image";
import Link from "next/link";
import { Phone } from "lucide-react";

export function Footer() {
  return (
    <footer
      className="relative mt-16 w-full overflow-hidden"
      style={{
        background: "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.04) 0%, rgba(80,50,20,0.08) 50%, rgba(40,25,10,0.12) 100%)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_auto_auto] gap-x-16 gap-y-8">
          {/* Column 1 - Brand */}
          <div>
            <Image
              src="/logo_sakura_2.png"
              alt="Сакура"
              width={1200}
              height={400}
              className="mb-4 h-[3.6rem] w-auto"
            />
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Крупнейшая сеть саун в Набережных Челнах. Русские бани, финские
              сауны, турецкие хамамы.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://vk.com/sakura_sauna"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="VK"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12.785 16.241s.288-.032.436-.194c.136-.148.132-.427.132-.427s-.02-1.304.587-1.496c.598-.188 1.368 1.259 2.183 1.815.616.42 1.084.328 1.084.328l2.175-.03s1.138-.07.598-.964c-.044-.073-.314-.661-1.618-1.869-1.366-1.265-1.183-1.06.462-3.246.999-1.33 1.398-2.142 1.273-2.49-.119-.332-.856-.244-.856-.244l-2.45.015s-.182-.025-.316.056c-.131.079-.216.263-.216.263s-.387 1.028-.903 1.903c-1.088 1.848-1.524 1.946-1.702 1.832-.413-.265-.31-1.065-.31-1.633 0-1.775.27-2.515-.524-2.707-.264-.064-.457-.106-1.13-.113-.864-.008-1.594.003-2.008.205-.276.134-.488.434-.359.451.16.021.522.098.714.358.248.336.24 1.09.24 1.09s.142 2.093-.333 2.352c-.327.177-.776-.185-1.738-1.842-.493-.848-.866-1.786-.866-1.786s-.072-.176-.2-.27c-.155-.115-.372-.151-.372-.151l-2.327.015s-.35.01-.478.162c-.114.135-.009.414-.009.414s1.816 4.244 3.873 6.384c1.886 1.963 4.029 1.834 4.029 1.834h.971z" />
                </svg>
              </a>
              <a
                href="tel:+79274651000"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Телефон"
              >
                <Phone className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Column 2 - Навигация */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Навигация</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Главная
                </Link>
              </li>
              <li>
                <Link
                  href="/complex-9"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  9 Комплекс
                </Link>
              </li>
              <li>
                <Link
                  href="/complex-50"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  50 Комплекс
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 - Документы */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Документы</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/oferta"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Публичная оферта
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Политика конфиденциальности
                </Link>
              </li>
              <li>
                <Link
                  href="/personal-data"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Согласие на обработку ПД
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom: copyright */}
        <div className="mt-10 pt-8 border-t border-white/5 text-sm text-muted-foreground">
          <span>&copy; 2026 Сакура. Все права защищены.</span>
        </div>
      </div>
    </footer>
  );
}
