import { loadEnvConfig } from "@next/env";
import { defineConfig } from "prisma/config";

loadEnvConfig(process.cwd());

const isPrismaMigrateCommand =
  process.argv.includes("migrate") || process.argv.includes("db");
const databaseUrl =
  isPrismaMigrateCommand && process.env.DIRECT_URL
    ? process.env.DIRECT_URL
    : process.env.DATABASE_URL;

if (!databaseUrl && isPrismaMigrateCommand) {
  throw new Error("DATABASE_URL must be set for Prisma.");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: databaseUrl ?? "postgresql://prisma:prisma@localhost:5432/prisma",
  },
});
