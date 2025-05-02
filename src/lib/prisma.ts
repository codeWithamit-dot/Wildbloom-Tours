import { PrismaClient } from "../../generated/prisma";

const globalForPrisma = global as typeof globalThis & {
  prisma?: PrismaClient;
};

const logLevels = process.env.PRISMA_LOG_QUERIES === "true"
  ? ["query", "info", "warn", "error"]
  : ["error"];

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: logLevels as Array<"query" | "info" | "warn" | "error">,
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export { prisma };