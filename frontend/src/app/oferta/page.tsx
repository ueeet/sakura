import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Публичная оферта — Сакура",
};

export default function OfertaPage() {
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

        <h1 className="font-heading text-4xl md:text-5xl mb-2">Публичная оферта</h1>
        <p className="text-sm text-muted-foreground mb-10">
          Сеть саун «Сакура», г. Набережные Челны
        </p>

        <div className="prose prose-invert max-w-none space-y-6 text-foreground/90 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              1. Общие положения
            </h2>
            <p>
              Настоящая публичная оферта (далее — «Оферта») является официальным
              предложением сети саун «Сакура» (далее — «Исполнитель») заключить
              договор оказания услуг бронирования и посещения саун на условиях,
              указанных ниже, с любым физическим лицом (далее — «Клиент»),
              принявшим условия настоящей Оферты.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              2. Предмет договора
            </h2>
            <p>
              Исполнитель обязуется предоставить Клиенту услуги по аренде помещения
              сауны на согласованный период времени, а Клиент обязуется оплатить
              эти услуги в порядке, установленном настоящей Офертой.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              3. Порядок бронирования и оплаты
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                Клиент выбирает сауну, дату и время посещения через сайт
                sauna-chelny.com
              </li>
              <li>
                При оформлении бронирования вносится предоплата в размере
                <strong> 30% </strong> от стоимости услуги. По желанию Клиент может
                оплатить полную стоимость онлайн.
              </li>
              <li>
                Оставшаяся часть оплачивается на месте перед посещением.
              </li>
              <li>
                Если оплата не поступила в течение 15 минут после оформления —
                бронирование автоматически отменяется.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              4. Условия отмены и возврата
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                Отмена более чем за 24 часа до начала — возврат 100% оплаченной
                суммы.
              </li>
              <li>Отмена за 12–24 часа — возврат 50%.</li>
              <li>Отмена менее чем за 12 часов или неявка — возврат не производится.</li>
              <li>
                Возврат осуществляется в течение 3–10 рабочих дней на банковскую
                карту, использованную при оплате.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              5. Права и обязанности сторон
            </h2>
            <p>
              Исполнитель обязуется предоставить помещение в надлежащем санитарном
              состоянии, обеспечить безопасность пребывания и сохранность личных
              вещей Клиента в специально отведённых местах.
            </p>
            <p>
              Клиент обязуется соблюдать правила посещения сауны, бережно
              относиться к имуществу Исполнителя и в случае его повреждения —
              возместить ущерб.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              6. Контакты
            </h2>
            <p>
              По всем вопросам обращайтесь по телефону +7 (927) 465-1000 или
              приходите по адресу: г. Набережные Челны, пр. Мира, д. 9/04А.
            </p>
          </section>

          <p className="text-sm text-muted-foreground mt-10 italic">
            Документ носит ознакомительный характер. Полная редакция оферты
            доступна по запросу у администратора.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
