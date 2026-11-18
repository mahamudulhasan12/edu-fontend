import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { createApp } from "./create-app.js";
import { createPrismaRepository } from "./prisma-repository.js";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be configured before starting the DTH API.");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
const repository = createPrismaRepository(prisma);

try {
  await prisma.$connect();
  const app = createApp({ repository });
  const port = Number(process.env.PORT) || 3001;
  const server = app.listen(port, "0.0.0.0", () => {
    console.log(`DTH API listening on http://localhost:${port}`);
  });

  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.on(signal, () => {
      server.close(() => {
        prisma.$disconnect()
          .then(() => pool.end())
          .finally(() => process.exit(0));
      });
    });
  }
} catch (error) {
  console.error("Could not start the DTH API. Check DATABASE_URL and PostgreSQL availability.", error);
  await prisma.$disconnect();
  await pool.end();
  process.exitCode = 1;
}
