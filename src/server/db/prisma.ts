import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __slydePrisma__: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var __slydePrismaAdapter__: PrismaPg | undefined;
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is required to initialize PrismaClient.");
  }

  const adapter =
    globalThis.__slydePrismaAdapter__ ??
    new PrismaPg({
      connectionString,
    });

  if (process.env.NODE_ENV !== "production") {
    globalThis.__slydePrismaAdapter__ = adapter;
  }

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma = globalThis.__slydePrisma__ ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__slydePrisma__ = prisma;
}
