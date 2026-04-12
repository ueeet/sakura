/**
 * On-demand revalidation endpoint.
 *
 * Бэкенд (Express) вызывает этот endpoint после мутаций,
 * чтобы мгновенно инвалидировать кеш Next.js fetch'ей с соответствующим тегом.
 *
 * Пример вызова из backend после PUT /api/saunas/:id:
 *
 *   await fetch(`${process.env.FRONTEND_URL}/api/revalidate`, {
 *     method: 'POST',
 *     headers: {
 *       'Content-Type': 'application/json',
 *       'Authorization': `Bearer ${process.env.REVALIDATE_SECRET}`,
 *     },
 *     body: JSON.stringify({ tag: 'saunas' }),
 *   });
 *
 * Поддерживаемые теги: см. ALLOWED_TAGS ниже — должны совпадать с
 * тегами, используемыми в publicApi.ts.
 *
 * Безопасность: endpoint защищён секретом REVALIDATE_SECRET.
 * Без корректного Bearer-токена — 401.
 */

import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET;

/** Теги, которые разрешено инвалидировать извне. */
const ALLOWED_TAGS = ["branches", "saunas", "promotions", "home"] as const;
type AllowedTag = (typeof ALLOWED_TAGS)[number];

function isAllowedTag(value: unknown): value is AllowedTag {
  return (
    typeof value === "string" &&
    (ALLOWED_TAGS as readonly string[]).includes(value)
  );
}

export async function POST(req: NextRequest) {
  // Конфиг-проверка: если секрет не задан — запрещаем вообще всё,
  // чтобы не оставить открытую дыру по недосмотру.
  if (!REVALIDATE_SECRET) {
    return NextResponse.json(
      { error: "Revalidate endpoint disabled: REVALIDATE_SECRET not set" },
      { status: 503 },
    );
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${REVALIDATE_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const tag = (body as { tag?: unknown })?.tag;
  if (!isAllowedTag(tag)) {
    return NextResponse.json(
      {
        error: "Unknown or missing tag",
        allowed: ALLOWED_TAGS,
      },
      { status: 400 },
    );
  }

  // В Next 16 revalidateTag требует второй аргумент — профиль.
  // 'max' = stale-while-revalidate (рекомендовано для route handlers):
  // следующий запрос получит свежие данные, но текущие посетители
  // продолжают видеть кешированный контент пока обновление не придёт.
  revalidateTag(tag, "max");
  return NextResponse.json({ revalidated: true, tag });
}
