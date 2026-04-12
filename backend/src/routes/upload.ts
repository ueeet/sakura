import express, { Router } from "express";
import multer from "multer";
import sharp from "sharp";
import { randomUUID } from "node:crypto";
import { requireAdmin } from "../middleware/auth";
import { asyncHandler } from "../middleware/asyncHandler";
import { supabase } from "../supabaseClient";
import logger from "../lib/logger";

const router = Router();
// Лимит 25 МБ — ретина-скриншоты и несжатые PNG из фотошопа легко лезут за 8 МБ.
// На выходе всё равно получится webp ~200–400 КБ, так что аплоадить можно спокойно.
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES },
});

const BUCKET = "photos";
let bucketEnsured = false;

async function ensureBucket() {
  if (bucketEnsured) return;
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = buckets?.some((b) => b.name === BUCKET);
    if (!exists) {
      const { error } = await supabase.storage.createBucket(BUCKET, {
        public: true,
        fileSizeLimit: 8 * 1024 * 1024,
      });
      if (error) {
        logger.warn({ err: error.message }, "Failed to create bucket");
        return;
      }
      logger.info(`Created Supabase bucket: ${BUCKET}`);
    }
    bucketEnsured = true;
  } catch (err) {
    logger.warn({ err }, "ensureBucket error");
  }
}

// Multer-ошибки (lIMIT_FILE_SIZE и др.) кидаются синхронно и мимо asyncHandler,
// поэтому ловим через отдельный middleware — иначе клиент получает HTML-500.
function handleMulter(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  upload.single("file")(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        res.status(413).json({
          error: `Файл слишком большой. Максимум ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} МБ`,
        });
        return;
      }
      res.status(400).json({ error: `Ошибка загрузки: ${err.message}` });
      return;
    }
    if (err) {
      next(err);
      return;
    }
    next();
  });
}

router.post(
  "/",
  requireAdmin,
  handleMulter,
  asyncHandler(async (req, res) => {
    if (!req.file) {
      res.status(400).json({ error: "Файл не передан" });
      return;
    }

    await ensureBucket();

    let buffer: Buffer;
    try {
      buffer = await sharp(req.file.buffer)
        .resize({ width: 1600, withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();
    } catch (err) {
      logger.error({ err }, "Sharp processing failed");
      res.status(400).json({ error: "Не удалось обработать изображение" });
      return;
    }

    const fileName = `${Date.now()}-${randomUUID().slice(0, 8)}.webp`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, buffer, {
        contentType: "image/webp",
        upsert: false,
      });

    if (uploadError) {
      logger.error({ err: uploadError.message }, "Supabase upload error");
      res.status(500).json({
        error: `Не удалось загрузить файл: ${uploadError.message}`,
      });
      return;
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
    res.json({ url: data.publicUrl });
  }),
);

export default router;
