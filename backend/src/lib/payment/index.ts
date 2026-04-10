import type { PaymentProvider } from "./types";
import { MockProvider } from "./mock";

let _provider: PaymentProvider | null = null;

/**
 * Возвращает активный платёжный провайдер.
 *
 * Контролируется PAYMENT_PROVIDER в .env:
 *   - "mock" (default) — болванка для демо
 *   - "yookassa" — реальная YooKassa (когда подключим)
 */
export function getPaymentProvider(): PaymentProvider {
  if (_provider) return _provider;

  const name = process.env.PAYMENT_PROVIDER || "mock";

  switch (name) {
    case "mock":
      _provider = new MockProvider();
      break;
    // case "yookassa":
    //   _provider = new YooKassaProvider();
    //   break;
    default:
      throw new Error(`Unknown payment provider: ${name}`);
  }

  return _provider;
}

export type { PaymentProvider, CreatePaymentInput, CreatePaymentResult, PaymentStatusResult, RefundInput } from "./types";
