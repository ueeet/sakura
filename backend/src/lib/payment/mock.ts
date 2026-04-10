import { randomUUID } from "node:crypto";
import type {
  CreatePaymentInput,
  CreatePaymentResult,
  PaymentProvider,
  PaymentStatusResult,
  RefundInput,
} from "./types";
import prisma from "../../prismaClient";

/**
 * MockProvider — демо-провайдер для показа хозяину.
 *
 * Не списывает реальные деньги. Возвращает confirmationUrl на нашу же
 * страницу /payment/[id], где юзер может нажать "Оплатить" (имитация).
 *
 * Когда заменяется на YooKassaProvider — фронт работает идентично.
 */
export class MockProvider implements PaymentProvider {
  readonly name = "mock";
  private readonly frontendUrl: string;

  constructor() {
    this.frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  }

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    // externalId генерируем сами — будет совпадать с Payment.externalId в БД
    const externalId = `mock_${randomUUID()}`;

    // confirmationUrl ведёт на нашу демо-страницу оплаты
    // Сама страница знает paymentId через query
    const confirmationUrl = `${this.frontendUrl}/payment/${externalId}?return_url=${encodeURIComponent(input.returnUrl)}`;

    return {
      externalId,
      confirmationUrl,
      status: "pending",
    };
  }

  async getStatus(externalId: string): Promise<PaymentStatusResult> {
    // Для mock-провайдера статус всегда читаем из БД
    const payment = await prisma.payment.findUnique({ where: { externalId } });
    if (!payment) {
      return { externalId, status: "canceled" };
    }
    return {
      externalId,
      status: payment.status as "pending" | "succeeded" | "canceled",
      paidAt: payment.paidAt ?? undefined,
      paymentMethod: payment.paymentMethod ?? undefined,
    };
  }

  async refund(input: RefundInput): Promise<{ refundId: string; amount: number }> {
    // Имитация возврата — просто отметка в БД
    return {
      refundId: `mock_refund_${randomUUID()}`,
      amount: input.amount,
    };
  }
}
