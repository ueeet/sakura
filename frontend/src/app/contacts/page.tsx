import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BookingForm } from "@/components/Booking";
import { MapPin, Phone, Clock } from "lucide-react";

export default function ContactsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">Контакты</h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            Свяжитесь с нами любым удобным способом
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
              <MapPin className="h-8 w-8 text-pink-600 dark:text-pink-400 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Адрес</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Указать адрес в настройках</p>
            </div>
            <div className="text-center p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
              <Phone className="h-8 w-8 text-pink-600 dark:text-pink-400 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Телефон</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Указать телефон в настройках</p>
            </div>
            <div className="text-center p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
              <Clock className="h-8 w-8 text-pink-600 dark:text-pink-400 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Часы работы</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Пн-Пт: 9:00–20:00<br />Сб-Вс: 10:00–18:00</p>
            </div>
          </div>
        </div>

        <BookingForm />
      </main>
      <Footer />
    </>
  );
}
