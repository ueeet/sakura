import { Router } from "express";
import bcrypt from "bcryptjs";
import { asyncHandler } from "../middleware/asyncHandler";
import { validate } from "../middleware/validate";
import { loginSchema, refreshSchema } from "../lib/validators";
import { generateTokens, verifyRefreshToken } from "../middleware/auth";
import prisma from "../prismaClient";

const router = Router();

router.post("/login", validate(loginSchema), asyncHandler(async (req, res) => {
  const { login, password } = req.body;
  const admin = await prisma.admin.findUnique({ where: { login } });
  if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
    res.status(401).json({ error: "Неверный логин или пароль" });
    return;
  }
  const tokens = generateTokens(admin.id, admin.role);
  res.json(tokens);
}));

router.post("/refresh", validate(refreshSchema), asyncHandler(async (req, res) => {
  try {
    const payload = verifyRefreshToken(req.body.refreshToken);
    if (payload.type !== "refresh") throw new Error("Invalid token type");
    const tokens = generateTokens(payload.adminId, payload.role);
    res.json(tokens);
  } catch {
    res.status(401).json({ error: "Недействительный refresh токен" });
  }
}));

router.post("/setup", asyncHandler(async (req, res) => {
  const count = await prisma.admin.count();
  if (count > 0) { res.status(403).json({ error: "Админ уже создан" }); return; }
  const { login, password } = req.body;
  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await prisma.admin.create({ data: { login, passwordHash } });
  const tokens = generateTokens(admin.id, admin.role);
  res.status(201).json(tokens);
}));

export default router;
