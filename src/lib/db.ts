import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'

// Load .env with override:true so the Supabase URL in .env
// takes precedence over any stale DATABASE_URL in the system environment.
config({ override: true })

// Global singleton — prevents creating multiple PrismaClient instances
// across hot-reloads (dev) and serverless function invocations (Vercel).
// Using globalThis ensures the same instance is reused.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error', 'warn'],
    // Limit connection pool — important for Supabase pooler (max 15 in session mode)
    datasources: {
      db: {
        // Prisma reads the URL from env; connection_limit is also set in the URL
      },
    },
  })

// Always cache on globalThis (both dev and production/Vercel)
// This prevents exhausting Supabase connection pool across invocations
globalForPrisma.prisma = db
