/**
 * Абстракция платёжного провайдера.
 *
 * Сейчас реализован MockProvider — болванка для демо без реальных денег.
 * Когда хозяин одобрит проект, добавляется YooKassaProvider с тем же интерфейсом,
 * меняется PAYMENT_PROVIDER в .env, остальной код не трогается.
 */

export interface CreatePaymentInput {
  bookingId: number;
  amount: number;        // в рублях
  type: "deposit" | "full";
  description: string;
  customerPhone: string;
  returnUrl: string;     // куда вернуть юзера после оплаты
}

export interface CreatePaymentResult {
  externalId: string;             // id платежа у провайдера
  confirmationUrl: string;        // куда редиректить юзера
  status: "pending";
}

export interface PaymentStatusResult {
  externalId: string;
  status: "pending" | "succeeded" | "canceled";
  paidAt?: Date;
  paymentMethod?: string;
}

export interface RefundInput {
  externalId: string;
  amount: number;
  reason?: string;
}

export interface PaymentProvider {
  readonly name: string;
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
  getStatus(externalId: string): Promise<PaymentStatusResult>;
  refund(input: RefundInput): Promise<{ refundId: string; amount: number }>;
}
