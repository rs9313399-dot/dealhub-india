import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Always create a fresh client to avoid stale schema cache after migrations
export const db = new PrismaClient({
  log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db