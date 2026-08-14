import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'

// Load .env with override:true so the Supabase URL in .env
// takes precedence over any stale DATABASE_URL in the system environment.
config({ override: true })

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
