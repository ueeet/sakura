/**
 * Универсальные хелперы для публичных запросов к бэку.
 *
 * Работают и в Server Components (SSR), и в Client Components.
 * Без авторизации (для админ-эндпоинтов используй lib/api.ts).
 */

import type {
  Branch,
  BranchWithSaunas,
  Sauna,
  Promotion,
  SaunaAvailability,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

async function publicGet<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`API ${path} failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const publicApi = {
  getBranches: () => publicGet<Branch[]>("/branches"),
  getBranchBySlug: (slug: string) => publicGet<BranchWithSaunas>(`/branches/${slug}`),
  getSaunaBySlug: (slug: string) => publicGet<Sauna>(`/saunas/${slug}`),
  getSaunas: (params?: { branchId?: number; categoryId?: number; type?: string }) => {
    const qs = new URLSearchParams();
    if (params?.branchId) qs.set("branchId", String(params.branchId));
    if (params?.categoryId) qs.set("categoryId", String(params.categoryId));
    if (params?.type) qs.set("type", params.type);
    const q = qs.toString();
    return publicGet<Sauna[]>(`/saunas${q ? "?" + q : ""}`);
  },
  getAvailability: (saunaId: number, date: string) =>
    publicGet<SaunaAvailability>(`/saunas/${saunaId}/availability?date=${date}`),
  getPromotions: () => publicGet<Promotion[]>("/promotions"),
};
