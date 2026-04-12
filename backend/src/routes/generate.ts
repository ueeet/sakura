import { Router } from "express";
import sharp from "sharp";
import { randomUUID } from "node:crypto";
import { requireAdmin } from "../middleware/auth";
import { asyncHandler } from "../middleware/asyncHandler";
import { supabase } from "../supabaseClient";
import logger from "../lib/logger";

const router = Router();

const BUCKET = "photos";

const ROUTERAI_URL = "https://routerai.ru/api/v1/chat/completions";
const IMAGE_MODEL = process.env.IMAGE_MODEL || "google/gemini-3.1-flash-image-preview";

// Мастер-промпт: крупный текст + реалистичный банный фон.
const STYLE_PREFIX = `Создай горизонтальный рекламный баннер 16:9 для премиального банного комплекса.

ТЕКСТ:
ЗАГЛАВНЫМИ БУКВАМИ (ALL CAPS), жирным шрифтом напиши: "`;

const STYLE_SUFFIX = `"

СТРОГИЕ ПРАВИЛА ТЕКСТА (нарушать ЗАПРЕЩЕНО):
1. Весь текст в ВЕРХНЕМ РЕГИСТРЕ (ALL CAPS).
2. Шрифт: Inter Bold, цвет светло-бежевый (#F5E6D3).
3. Высота каждой буквы — РОВНО 48 пикселей при разрешении баннера 1600×900. Этот размер ФИКСИРОВАН и ОДИНАКОВ для ВСЕХ баннеров. НИКОГДА не увеличивай и не уменьшай размер букв.
4. Если текст не помещается в одну строку — ОБЯЗАТЕЛЬНО разбей на 2 или 3 строки. Размер букв при этом НЕ МЕНЯЕТСЯ.
5. Текст расположен по центру баннера (и по горизонтали, и по вертикали).
6. Отступы от краёв баннера — минимум 5%.

ПРАВИЛА ЧИТАЕМОСТИ (нарушать ЗАПРЕЩЕНО):
— За текстом — затемнение фона в виде ВИНЬЕТКИ: самое тёмное место (~30% opacity) точно за центром текста, и оно ОЧЕНЬ ПЛАВНО, ГРАДИЕНТНО растворяется во все стороны к чистому фону. Радиус перехода — огромный, занимает почти весь баннер. НЕ ДОЛЖНО БЫТЬ НИКАКИХ видимых границ, полос, линий или резких переходов между тёмной и светлой зоной. Переход настолько плавный, что невозможно сказать, где он начинается и где заканчивается.
— ЗАПРЕЩЕНО: блюрить, размывать, делать боке или любое искажение фона за текстом. Фон остаётся резким — меняется только яркость.

ФОН:
Реалистичная РЕЗКАЯ фотография (НЕ размывай фон, никакого блюра или боке), снятая на профессиональную камеру:
— Каждый баннер — СОВЕРШЕННО ДРУГОЙ ракурс и сцена. Случайно выбери одну из этих тем:
  * Панорама парной изнутри — деревянные полки, пар поднимается к потолку, тёплый свет
  * Крупный план: горячие камни с водой, от которых идёт густой пар
  * Уютная зона отдыха: деревянный стол, травяной чай, полотенца, свечи
  * Бассейн или купель с голубой водой, деревянная отделка вокруг
  * Берёзовые и дубовые веники крупным планом с каплями воды
  * Открытая терраса банного комплекса, вечернее освещение, фонари
  * Печь-каменка с огнём, ковш, дрова
— Цветовая гамма: тёплые натуральные тона — мёд, янтарь, тёмное дерево, зелень листвы.
— НЕ добавляй блюр, боке или размытие на фон. Фотография должна быть чёткой.
— НЕ добавляй логотипы, водяные знаки или людей.`;

async function generateImage(
  prompt: string,
  apiKey: string,
  referenceBase64?: string,
): Promise<Buffer> {
  // Формируем content: текст + опциональный референс
  const content: Array<{ type: string; text?: string; image_url?: { url: string } }> = [];

  const styledPrompt = STYLE_PREFIX + prompt + STYLE_SUFFIX;

  if (referenceBase64) {
    content.push({
      type: "image_url",
      image_url: { url: referenceBase64 },
    });
    content.push({
      type: "text",
      text: `Используй прикреплённое изображение как референс стиля. ${styledPrompt}`,
    });
  } else {
    content.push({ type: "text", text: styledPrompt });
  }

  const res = await fetch(ROUTERAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: IMAGE_MODEL,
      messages: [{ role: "user", content }],
      modalities: ["image", "text"],
      stream: false,
      image_config: {
        aspect_ratio: "16:9",
        image_size: "2K",
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`RouterAI ${res.status}: ${err}`);
  }

  const data = await res.json();
  const message = data.choices?.[0]?.message;

  // base64 в images[]
  if (message?.images?.length) {
    const dataUrl: string = message.images[0].image_url?.url ?? message.images[0].url;
    if (dataUrl) {
      const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, "");
      return Buffer.from(base64, "base64");
    }
  }

  // fallback: base64 inline в content
  if (message?.content) {
    const match = message.content.match(/data:image\/[^;]+;base64,([A-Za-z0-9+/=]+)/);
    if (match) {
      return Buffer.from(match[1], "base64");
    }
  }

  throw new Error("ИИ не вернул изображение. Попробуйте другой промпт.");
}

router.post(
  "/",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { prompt, referenceImage } = req.body;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      res.status(400).json({ error: "Промпт не указан" });
      return;
    }

    const apiKey = process.env.ROUTERAI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: "ROUTERAI_API_KEY не настроен на сервере" });
      return;
    }

    let rawImage: Buffer;

    try {
      rawImage = await generateImage(prompt.trim(), apiKey, referenceImage);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Неизвестная ошибка";
      logger.error({ err: message }, "Image generation error");
      res.status(502).json({ error: `Ошибка генерации: ${message}` });
      return;
    }

    let buffer: Buffer;
    try {
      buffer = await sharp(rawImage)
        .resize({ width: 1600, withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();
    } catch (err) {
      logger.error({ err }, "Sharp processing failed for AI image");
      res.status(500).json({ error: "Не удалось обработать сгенерированное изображение" });
      return;
    }

    const fileName = `ai-${Date.now()}-${randomUUID().slice(0, 8)}.webp`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, buffer, {
        contentType: "image/webp",
        upsert: false,
      });

    if (uploadError) {
      logger.error({ err: uploadError.message }, "Supabase upload error (AI image)");
      res.status(500).json({ error: `Не удалось загрузить: ${uploadError.message}` });
      return;
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
    res.json({ url: data.publicUrl });
  }),
);

export default router;
