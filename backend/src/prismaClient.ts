import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import type { PrismaClient as PrismaClientType } from "./generated/prisma/client";

let _prisma: PrismaClientType | null = null;

export function initPrisma(): PrismaClientType {
  if (_prisma) return _prisma;
  const { PrismaClient } = require("./generated/prisma/client");

  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false },
  });

  const adapter = new PrismaPg(pool);
  _prisma = new PrismaClient({ adapter }) as PrismaClientType;
  return _prisma!;
}

const handler: ProxyHandler<PrismaClientType> = {
  get(_, prop) {
    return (initPrisma() as unknown as Record<string | symbol, unknown>)[prop];
  },
};

const prisma = new Proxy({} as PrismaClientType, handler);
export default prisma;
