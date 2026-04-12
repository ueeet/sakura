/**
 * On-demand инвалидация кеша Next.js фронтенда.
 *
 * После успешной мутации на backend (POST/PUT/DELETE саун, бранчей, цен,
 * категорий, акций) вызываем webhook на фронте → `revalidateTag('...')`,
 * чтобы публичные страницы мгновенно показывали актуальные данные без
 * ожидания истечения 60-секундного кеша.
 *
 * Контракт фронтового endpoint'а: см. frontend/src/app/api/revalidate/route.ts
 *
 * Важно: вызовы fire-and-forget — если фронт недоступен или медленный,
 * это НЕ должно блокировать ответ клиенту API. Ошибки логируем, но не
 * бросаем.
 */

import logger from "./logger";

/** Теги, поддерживаемые фронтовым webhook'ом. Держим в синхроне. */
export type RevalidateTag = "branches" | "saunas" | "promotions" | "home";

/**
 * Отправляет POST на фронт-webhook с тегом для инвалидации.
 * Никогда не бросает — при ошибке только логирует.
 *
 * ВАЖНО: env читается внутри функции, а не на top-level.
 * Причина: ES import hoisting — все импорты поднимаются выше dotenv.config()
 * в index.ts, поэтому на уровне модуля env ещё пустой. Читаем лениво.
 */
export function triggerRevalidate(tag: RevalidateTag): void {
  const FRONTEND_URL = process.env.FRONTEND_URL;
  const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET;

  if (!FRONTEND_URL || !REVALIDATE_SECRET) {
    // Не настроено — тихо пропускаем, не спамим логи на каждый запрос.
    return;
  }

  const url = `${FRONTEND_URL}/api/revalidate`;

  // fire-and-forget: не await'им, чтобы не задерживать ответ клиенту
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${REVALIDATE_SECRET}`,
    },
    body: JSON.stringify({ tag }),
  })
    .then((res) => {
      if (!res.ok) {
        logger.warn(
          { tag, status: res.status },
          "Frontend revalidate webhook returned non-2xx",
        );
      } else {
        logger.debug({ tag }, "Frontend cache revalidated");
      }
    })
    .catch((err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      logger.warn({ tag, error: message }, "Failed to call revalidate webhook");
    });
}

/**
 * Определяет тег для инвалидации по пути запроса.
 * Возвращает null, если путь не относится к кешируемым публичным данным.
 *
 * Маппинг:
 * - /api/saunas/*   → saunas
 * - /api/prices/*   → saunas (цены — часть данных саун)
 * - /api/branches/* → branches
 * - /api/categories/* → branches (категории — часть веток)
 * - /api/promotions/* → promotions
 * - /api/settings    → home (слайды главной живут внутри settings)
 * - /api/home/*      → home
 */
export function tagForPath(path: string): RevalidateTag | null {
  if (path.startsWith("/api/saunas") || path.startsWith("/api/prices")) {
    return "saunas";
  }
  if (path.startsWith("/api/branches") || path.startsWith("/api/categories")) {
    return "branches";
  }
  if (path.startsWith("/api/promotions")) {
    return "promotions";
  }
  if (path.startsWith("/api/settings") || path.startsWith("/api/home")) {
    return "home";
  }
  return null;
}
