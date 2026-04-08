import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

let _prisma: any = null;

export function initPrisma() {
  if (_prisma) return _prisma;
  const { PrismaClient } = require("./generated/prisma/client");

  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false },
  });

  const adapter = new PrismaPg(pool);
  _prisma = new PrismaClient({ adapter });
  return _prisma;
}

const handler: ProxyHandler<object> = {
  get(_, prop) { return initPrisma()[prop]; },
};
export default new Proxy({}, handler);
