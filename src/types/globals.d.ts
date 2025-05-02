import { PrismaClient } from '../../generated/prisma';

declare global {
  namespace NodeJS {
    interface Global {
      prisma: PrismaClient | undefined;
    }
  }

  type Role = "USER" | "ADMIN";

  interface AuthUser {
    id: string;
    email: string;
    role: Role;
  }
}

export {};
