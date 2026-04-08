import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";
import { BookingForm } from "@/components/Booking";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />

        <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Почему выбирают нас</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
              Мы ценим каждого клиента и гарантируем высочайшее качество обслуживания
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "Опытная команда", desc: "Профессионалы с многолетним стажем работы" },
                { title: "Современное оборудование", desc: "Используем только лучшее оборудование и материалы" },
                { title: "Удобная запись", desc: "Онлайн-запись 24/7, подтверждение через SMS и Telegram" },
              ].map((item) => (
                <div key={item.title} className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <BookingForm />
      </main>
      <Footer />
    </>
  );
}
