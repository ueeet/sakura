import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface JwtPayload { adminId: number; role: string; }

function getSecret(): string { return process.env.JWT_SECRET!; }

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Токен не предоставлен" });
    return;
  }
  try {
    const payload = jwt.verify(authHeader.split(" ")[1], getSecret()) as JwtPayload;
    (req as Request & { admin: JwtPayload }).admin = payload;
    next();
  } catch {
    res.status(401).json({ error: "Недействительный или просроченный токен" });
  }
}

export function generateTokens(adminId: number, role: string) {
  const accessToken = jwt.sign({ adminId, role }, getSecret(), { expiresIn: "15m" });
  const refreshToken = jwt.sign({ adminId, role, type: "refresh" }, getSecret(), { expiresIn: "7d" });
  return { accessToken, refreshToken };
}

export function verifyRefreshToken(token: string): JwtPayload & { type: string } {
  return jwt.verify(token, getSecret()) as JwtPayload & { type: string };
}
