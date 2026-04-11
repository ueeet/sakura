import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Политика конфиденциальности — Сакура",
};

export default function PrivacyPage() {
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
          Политика конфиденциальности
        </h1>
        <p className="text-sm text-muted-foreground mb-10">
          Сеть саун «Сакура»
        </p>

        <div className="prose prose-invert max-w-none space-y-6 text-foreground/90 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              1. Общие положения
            </h2>
            <p>
              Настоящая Политика регулирует порядок обработки и защиты персональных
              данных пользователей сайта sauna-chelny.com в соответствии с
              требованиями Федерального закона от 27.07.2006 № 152-ФЗ
              «О персональных данных».
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              2. Какие данные мы собираем
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Имя</li>
              <li>Номер телефона</li>
              <li>
                Технические данные: IP-адрес, тип браузера, время посещения
                (через cookies и счётчики метрики)
              </li>
            </ul>
            <p>
              Эти данные используются исключительно для целей оформления и
              подтверждения бронирования.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              3. Цели обработки
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Обработка заявок и подтверждение бронирований</li>
              <li>Связь с клиентом по поводу бронирования</li>
              <li>Информирование об акциях и специальных предложениях</li>
              <li>Улучшение работы сайта и сервиса</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              4. Хранение и защита
            </h2>
            <p>
              Персональные данные хранятся на защищённых серверах с применением
              современных средств защиты информации. Доступ к данным имеют только
              уполномоченные сотрудники «Сакуры».
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              5. Передача третьим лицам
            </h2>
            <p>
              «Сакура» не передаёт персональные данные третьим лицам, за исключением
              случаев, предусмотренных законодательством РФ, и платёжных операторов
              (например, ЮKassa) для проведения онлайн-оплаты.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              6. Ваши права
            </h2>
            <p>
              Вы имеете право в любой момент запросить изменение или удаление своих
              персональных данных, отозвать согласие на их обработку, направив
              запрос на info@sauna-chelny.com.
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
