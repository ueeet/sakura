import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Согласие на обработку персональных данных — Сакура",
};

export default function PersonalDataPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />

      <main className="container mx-auto flex-1 max-w-3xl px-4 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-forest transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          На главную
        </Link>

        <h1 className="font-heading text-4xl md:text-5xl mb-2">
          Согласие на обработку персональных данных
        </h1>
        <p className="text-sm text-muted-foreground mb-10">
          В соответствии с 152-ФЗ
        </p>

        <div className="prose prose-invert max-w-none space-y-6 text-foreground/90 leading-relaxed">
          <p>
            Оформляя бронирование на сайте sauna-chelny.com, я свободно, своей
            волей и в своём интересе даю согласие сети саун «Сакура» на обработку
            моих персональных данных в соответствии с Федеральным законом
            от 27.07.2006 № 152-ФЗ «О персональных данных».
          </p>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              Перечень персональных данных
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Фамилия, имя</li>
              <li>Номер мобильного телефона</li>
              <li>Адрес электронной почты (при наличии)</li>
              <li>Дата и время бронирования</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              Цели обработки
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Оформление и подтверждение бронирования</li>
              <li>Связь с клиентом для уточнения деталей визита</li>
              <li>Направление информационных сообщений (с возможностью отказа)</li>
              <li>Обеспечение качества обслуживания</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              Перечень действий
            </h2>
            <p>
              Сбор, запись, систематизация, накопление, хранение, уточнение
              (обновление, изменение), использование, передача (предоставление,
              доступ), блокирование, удаление и уничтожение персональных данных,
              осуществляемые как с использованием средств автоматизации, так и
              без них.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              Срок действия согласия
            </h2>
            <p>
              Настоящее согласие действует с момента его предоставления и до
              момента отзыва. Согласие может быть отозвано в любое время путём
              направления письменного заявления на электронную почту
              info@sauna-chelny.com.
            </p>
          </section>

          <p className="text-sm text-muted-foreground mt-10 italic">
            Документ носит ознакомительный характер. Полная редакция доступна
            по запросу у администратора.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
