"use client";

import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Smartphone, Lock, CheckCircle2, XCircle, Loader2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

interface Payment {
  id: number;
  bookingId: number;
  externalId: string;
  amount: number;
  currency: string;
  status: "pending" | "succeeded" | "canceled";
  type: "deposit" | "full";
  booking?: {
    id: number;
    clientName: string;
    startAt: string;
    endAt: string;
    sauna?: { name: string };
    branch?: { name: string };
    totalPrice: number | null;
  };
}

type PaymentMethod = "card" | "sbp";

export default function PaymentPage({
  params,
}: {
  params: Promise<{ externalId: string }>;
}) {
  const { externalId } = use(params);
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("return_url") || "/";
  const router = useRouter();

  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [processing, setProcessing] = useState(false);
  const [stage, setStage] = useState<"form" | "processing" | "success">("form");

  // Загружаем информацию о платеже
  useEffect(() => {
    fetch(`${API_URL}/payments/${externalId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Платёж не найден");
        return r.json();
      })
      .then(setPayment)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [externalId]);

  const formatRub = (n: number) => new Intl.NumberFormat("ru-RU").format(n) + " ₽";

  const formatBookingTime = (iso?: string) => {
    if (!iso) return "";
    return new Date(iso).toLocaleString("ru-RU", {
      timeZone: "Europe/Moscow",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handlePay = async () => {
    setProcessing(true);
    setStage("processing");

    // Имитация запроса к процессингу
    await new Promise((r) => setTimeout(r, 1500));

    try {
      const res = await fetch(`${API_URL}/payments/mock/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ externalId }),
      });
      if (!res.ok) throw new Error("Ошибка оплаты");

      setStage("success");
      // Через 1.5 секунды редирект на return_url
      setTimeout(() => {
        router.push(returnUrl);
      }, 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
      setStage("form");
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Отменить оплату? Бронь будет аннулирована.")) return;
    try {
      await fetch(`${API_URL}/payments/mock/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ externalId }),
      });
      router.push(returnUrl);
    } catch {
      router.push(returnUrl);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#5B5FEC]" />
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 max-w-md text-center shadow-sm">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Платёж не найден</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      {/* Шапка */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-[#5B5FEC] font-bold text-lg tracking-tight">YooKassa</div>
            <span className="text-xs text-gray-400 px-2 py-0.5 rounded bg-gray-100">DEMO</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Lock className="h-3.5 w-3.5" />
            <span>Защищённое соединение</span>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Информация о магазине */}
        <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">Оплата получателю</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">Сауны Сакура</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">К оплате</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{formatRub(payment.amount)}</p>
            </div>
          </div>

          {payment.booking && (
            <div className="border-t border-gray-100 pt-4 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Бронь №</span>
                <span className="text-gray-900 font-medium">{payment.booking.id}</span>
              </div>
              {payment.booking.sauna && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Сауна</span>
                  <span className="text-gray-900 font-medium">{payment.booking.sauna.name}</span>
                </div>
              )}
              {payment.booking.branch && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Филиал</span>
                  <span className="text-gray-900 font-medium">{payment.booking.branch.name}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Время</span>
                <span className="text-gray-900 font-medium">{formatBookingTime(payment.booking.startAt)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Тип оплаты</span>
                <span className="text-gray-900 font-medium">
                  {payment.type === "full" ? "Полная оплата" : "Предоплата"}
                </span>
              </div>
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {stage === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {/* Способы оплаты */}
              <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Способ оплаты</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setMethod("card")}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-colors ${
                      method === "card"
                        ? "border-[#5B5FEC] bg-[#5B5FEC]/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <CreditCard className={`h-5 w-5 ${method === "card" ? "text-[#5B5FEC]" : "text-gray-400"}`} />
                    <span className={`text-sm font-medium ${method === "card" ? "text-[#5B5FEC]" : "text-gray-700"}`}>
                      Банковская карта
                    </span>
                  </button>
                  <button
                    onClick={() => setMethod("sbp")}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-colors ${
                      method === "sbp"
                        ? "border-[#5B5FEC] bg-[#5B5FEC]/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Smartphone className={`h-5 w-5 ${method === "sbp" ? "text-[#5B5FEC]" : "text-gray-400"}`} />
                    <span className={`text-sm font-medium ${method === "sbp" ? "text-[#5B5FEC]" : "text-gray-700"}`}>
                      СБП
                    </span>
                  </button>
                </div>
              </div>

              {/* Форма карты или СБП */}
              <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
                {method === "card" ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1.5">Номер карты</label>
                      <input
                        type="text"
                        placeholder="0000 0000 0000 0000"
                        defaultValue="4242 4242 4242 4242"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base font-mono focus:outline-none focus:border-[#5B5FEC]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1.5">Месяц / Год</label>
                        <input
                          type="text"
                          placeholder="ММ / ГГ"
                          defaultValue="12 / 28"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base font-mono focus:outline-none focus:border-[#5B5FEC]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1.5">CVC / CVV</label>
                        <input
                          type="text"
                          placeholder="000"
                          defaultValue="123"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base font-mono focus:outline-none focus:border-[#5B5FEC]"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="inline-block p-4 bg-gray-50 rounded-2xl mb-4">
                      <div className="w-32 h-32 bg-white border-2 border-gray-200 rounded flex items-center justify-center">
                        <span className="text-xs text-gray-400">QR-код</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">Отсканируйте QR-код в приложении банка</p>
                  </div>
                )}
              </div>

              {/* Кнопки */}
              <button
                onClick={handlePay}
                disabled={processing}
                className="w-full py-4 bg-[#5B5FEC] hover:bg-[#4a4ed4] disabled:opacity-50 text-white font-semibold rounded-xl transition-colors text-base"
              >
                Оплатить {formatRub(payment.amount)}
              </button>
              <button
                onClick={handleCancel}
                className="w-full py-3 mt-2 text-gray-500 hover:text-gray-700 text-sm transition-colors"
              >
                Отменить оплату
              </button>

              {/* Демо-баннер */}
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-xs text-amber-800 text-center">
                  ⓘ Это демо-страница оплаты. Реальные деньги <strong>не списываются</strong>. Любая карта подойдёт.
                </p>
              </div>
            </motion.div>
          )}

          {stage === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-2xl p-12 text-center shadow-sm"
            >
              <Loader2 className="h-12 w-12 text-[#5B5FEC] animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Обрабатываем платёж</h3>
              <p className="text-sm text-gray-500">Не закрывайте страницу...</p>
            </motion.div>
          )}

          {stage === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-2xl p-12 text-center shadow-sm"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
              >
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Оплата прошла успешно</h3>
              <p className="text-sm text-gray-500">Перенаправляем на сайт...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Футер */}
        <div className="mt-6 text-center text-xs text-gray-400">
          <p>Демонстрационная страница оплаты · Сакура</p>
        </div>
      </div>
    </div>
  );
}
