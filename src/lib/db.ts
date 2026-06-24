import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

function createPrismaClient() {
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  if (tursoUrl) {
    // Production: use Turso (serverless SQLite over HTTP)
    const adapter = new PrismaLibSQL({
      url: tursoUrl,
      authToken: tursoToken,
    })
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
    })
  }

  // Local dev: use local SQLite file directly
  return new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
  })
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db