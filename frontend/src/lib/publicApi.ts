/**
 * Универсальные хелперы для публичных запросов к бэку.
 *
 * Работают и в Server Components (SSR), и в Client Components.
 * Без авторизации (для админ-эндпоинтов используй lib/api.ts).
 *
 * Кеширование:
 * - По умолчанию данные кешируются на 60 секунд (next.revalidate = 60).
 *   Это многократно ускоряет повторные заходы на страницы со стабильными
 *   данными (филиалы, сауны, цены, акции).
 * - Для реально динамических данных (слоты доступности) используется
 *   { revalidate: false } → cache: "no-store".
 *
 * ВАЖНО: чтобы этот кеш вообще заработал, на странице НЕ должно быть
 * `export const dynamic = "force-dynamic"` — он принудительно превращает
 * любой fetch в no-store. Используй `export const revalidate = N`.
 */

import type {
  Branch,
  BranchWithSaunas,
  Sauna,
  Promotion,
  SaunaAvailability,
  HomeSlide,
  Review,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

type PublicGetOptions = {
  /** Время жизни кеша в секундах. `false` = не кешировать (cache: "no-store"). */
  revalidate?: number | false;
  /** Тег(и) для on-demand инвалидации через /api/revalidate. */
  tags?: readonly string[];
};

async function publicGet<T>(
  path: string,
  options: PublicGetOptions = {},
): Promise<T> {
  const { revalidate = 60, tags } = options;
  const init: RequestInit =
    revalidate === false
      ? { cache: "no-store" }
      : { next: { revalidate, tags: tags ? [...tags] : undefined } };
  const res = await fetch(`${API_URL}${path}`, init);
  if (!res.ok) {
    throw new Error(`API ${path} failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

/**
 * Теги кеша для on-demand revalidation.
 * Backend вызывает /api/revalidate с этими тегами после мутаций.
 */
export const CACHE_TAGS = {
  branches: "branches",
  saunas: "saunas",
  promotions: "promotions",
  home: "home",
  reviews: "reviews",
} as const;

export const publicApi = {
  getBranches: () =>
    publicGet<Branch[]>("/branches", { tags: [CACHE_TAGS.branches] }),
  getBranchBySlug: (slug: string) =>
    publicGet<BranchWithSaunas>(`/branches/${slug}`, {
      // branch включает список саун → инвалидируем и при изменении веток, и саун
      tags: [CACHE_TAGS.branches, CACHE_TAGS.saunas],
    }),
  getSaunaBySlug: (slug: string) =>
    publicGet<Sauna>(`/saunas/${slug}`, { tags: [CACHE_TAGS.saunas] }),
  getSaunas: (params?: { branchId?: number; categoryId?: number; type?: string }) => {
    const qs = new URLSearchParams();
    if (params?.branchId) qs.set("branchId", String(params.branchId));
    if (params?.categoryId) qs.set("categoryId", String(params.categoryId));
    if (params?.type) qs.set("type", params.type);
    const q = qs.toString();
    return publicGet<Sauna[]>(`/saunas${q ? "?" + q : ""}`, {
      tags: [CACHE_TAGS.saunas],
    });
  },
  /**
   * Слоты доступности — всегда свежие, без кеша.
   * Клиент должен видеть актуальное расписание, иначе возможны
   * двойные брони одного и того же слота.
   */
  getAvailability: (saunaId: number, date: string) =>
    publicGet<SaunaAvailability>(
      `/saunas/${saunaId}/availability?date=${date}`,
      { revalidate: false },
    ),
  /**
   * Batch — какие сауны свободны на указанный интервал.
   * Используется на /search для фильтрации списка под выбранную дату/время.
   */
  getBatchAvailability: (date: string, startHour: number, endHour: number) =>
    publicGet<{ available: Record<number, boolean> }>(
      `/saunas/availability/batch?date=${date}&startHour=${startHour}&endHour=${endHour}`,
      { revalidate: false },
    ),
  getPromotions: () =>
    publicGet<Promotion[]>("/promotions", { tags: [CACHE_TAGS.promotions] }),
  getHomeSlides: () =>
    publicGet<HomeSlide[]>("/home/slides", { tags: [CACHE_TAGS.home] }),
  getReviews: () =>
    publicGet<Review[]>("/reviews", { tags: [CACHE_TAGS.reviews] }),
};
