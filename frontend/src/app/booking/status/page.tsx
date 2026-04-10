"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2, XCircle, Calendar, Phone, Users } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

interface Booking {
  id: number;
  clientName: string;
  phone: string;
  startAt: string;
  endAt: string;
  guests: number;
  totalPrice: number | null;
  status: string;
  paymentStatus: string;
  paidAmount: number;
  branch?: { name: string };
  sauna?: { name: string };
}

function StatusContent() {
  const params = useSearchParams();
  const bookingId = params.get("bookingId");

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(true);

  useEffect(() => {
    if (!bookingId) return;

    let cancelled = false;
    let attempts = 0;

    const poll = async () => {
      if (cancelled) return;
      attempts++;
      try {
        // Берём бронь — для этого пробуем через payments endpoint
        // Точнее: используем /api/payments/<externalId> можно, но проще опросить /api/me, или /api/admin
        // Используем /api/saunas/:id/availability — нет, нам нужна сама бронь
        // Решение: использовать SSE или сделать публичный GET /api/bookings/:id
        // Пока используем прямой запрос к одному из админ-эндпоинтов через токен… нет, публичного нет.
        // ВРЕМЕННО: используем тот факт, что после успешной оплаты webhook обновит booking,
        // и фронт получит обновление через polling /api/payments/<externalId>
        // Но мы знаем bookingId, не externalId. Сделаем публичный GET /api/bookings/:id/public

        const res = await fetch(`${API_URL}/bookings/${bookingId}/public`);
        if (res.ok) {
          const data = await res.json();
          if (cancelled) return;
          setBooking(data);
          setLoading(false);
          // Если оплата прошла или окончательно отменилась — стоп
          if (data.paymentStatus !== "pending" || data.status === "cancelled") {
            setPolling(false);
            return;
          }
        }
      } catch {}

      if (attempts < 30 && !cancelled) {
        setTimeout(poll, 2000);
      } else {
        setPolling(false);
        setLoading(false);
      }
    };

    poll();
    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleString("ru-RU", {
      timeZone: "Europe/Moscow",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (!bookingId) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 max-w-md text-center shadow-sm">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Не указан bookingId</h2>
        </div>
      </div>
    );
  }

  if (loading || polling) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-12 max-w-md text-center shadow-sm">
          <Loader2 className="h-12 w-12 text-[#5B5FEC] animate-spin mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Проверяем оплату...</h2>
          <p className="text-sm text-gray-500">Это занимает несколько секунд</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 max-w-md text-center shadow-sm">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Бронь не найдена</h2>
          <Link href="/" className="text-[#5B5FEC] text-sm">На главную</Link>
        </div>
      </div>
    );
  }

  const isPaid = booking.paymentStatus === "deposit_paid" || booking.paymentStatus === "fully_paid";
  const isCancelled = booking.status === "cancelled";

  return (
    <div className="min-h-screen bg-[#F5F5F7] py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
          {isPaid ? (
            <>
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Бронь подтверждена!</h1>
              <p className="text-gray-500 mb-6">
                Мы свяжемся с вами для уточнения деталей.
              </p>
            </>
          ) : isCancelled ? (
            <>
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Бронь отменена</h1>
              <p className="text-gray-500 mb-6">Оплата не прошла или была отменена.</p>
            </>
          ) : (
            <>
              <Loader2 className="h-12 w-12 text-amber-500 animate-spin mx-auto mb-4" />
              <h1 className="text-xl font-bold text-gray-900 mb-2">Ожидаем оплату</h1>
              <p className="text-gray-500 mb-6">Если вы не завершили оплату — повторите попытку.</p>
            </>
          )}

          <div className="text-left bg-gray-50 rounded-xl p-4 space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Бронь №</span>
              <span className="font-medium text-gray-900">{booking.id}</span>
            </div>
            {booking.sauna && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Сауна</span>
                <span className="font-medium text-gray-900">{booking.sauna.name}</span>
              </div>
            )}
            {booking.branch && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Филиал</span>
                <span className="font-medium text-gray-900">{booking.branch.name}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> Начало
              </span>
              <span className="font-medium text-gray-900">{formatTime(booking.startAt)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> Конец
              </span>
              <span className="font-medium text-gray-900">{formatTime(booking.endAt)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" /> Гостей
              </span>
              <span className="font-medium text-gray-900">{booking.guests}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" /> Телефон
              </span>
              <span className="font-medium text-gray-900">{booking.phone}</span>
            </div>
            {booking.totalPrice && (
              <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between text-sm">
                <span className="text-gray-500">К оплате</span>
                <span className="font-semibold text-gray-900">
                  {new Intl.NumberFormat("ru-RU").format(booking.totalPrice)} ₽
                </span>
              </div>
            )}
            {booking.paidAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Оплачено</span>
                <span className="font-semibold text-green-600">
                  {new Intl.NumberFormat("ru-RU").format(booking.paidAmount)} ₽
                </span>
              </div>
            )}
          </div>

          <Link
            href="/"
            className="inline-block px-6 py-3 bg-[#5B5FEC] hover:bg-[#4a4ed4] text-white font-medium rounded-xl transition-colors"
          >
            На главную
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function BookingStatusPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-[#5B5FEC] animate-spin" />
      </div>
    }>
      <StatusContent />
    </Suspense>
  );
}
