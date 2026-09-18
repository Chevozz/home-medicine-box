// Singleton Prisma client for Next.js 15 Server Components & Route Handlers
// Safe for Vercel Serverless environment
// See: https://vercel.com/guides/using-prisma-with-vercel
//
// Note: Prisma Client is generated in the backend folder and copied to frontend
// for the build. Ensure you run `npx prisma generate` in the backend before building.

import type { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient =
  globalForPrisma.prisma || new (require("@prisma/client").PrismaClient)();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
