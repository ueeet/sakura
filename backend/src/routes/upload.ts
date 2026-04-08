import { Router } from "express";
import multer from "multer";
import sharp from "sharp";
import { requireAdmin } from "../middleware/auth";
import { asyncHandler } from "../middleware/asyncHandler";
import { supabase } from "../supabaseClient";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.post("/", requireAdmin, upload.single("file"), asyncHandler(async (req, res) => {
  if (!req.file) { res.status(400).json({ error: "Файл не передан" }); return; }

  const buffer = await sharp(req.file.buffer)
    .resize({ width: 600, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();

  const fileName = `${Date.now()}.webp`;
  const { error } = await supabase.storage.from("photos").upload(fileName, buffer, {
    contentType: "image/webp",
  });
  if (error) throw error;

  const { data } = supabase.storage.from("photos").getPublicUrl(fileName);
  res.json({ url: data.publicUrl });
}));

export default router;
