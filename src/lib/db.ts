import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'

// Load .env with override:true so the Supabase URL in .env
// takes precedence over any stale DATABASE_URL in the system environment.
config({ override: true })

// Global singleton — prevents creating multiple PrismaClient instances
// across hot-reloads (dev) and serverless function invocations (Vercel).
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Safety check: if the cached PrismaClient is stale (missing models that
// exist in the current schema), discard it and create a fresh one.
// This fixes "Cannot read properties of undefined (reading 'findMany')"
// when the schema is updated but globalThis still holds an old client.
const cached = globalForPrisma.prisma
const isStale = cached && typeof (cached as any).seatingTable === 'undefined'

if (isStale) {
  // Old client cached — discard it
  try { (cached as any)?.$disconnect?.() } catch {}
  globalForPrisma.prisma = undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error', 'warn'],
  })

// Always cache on globalThis (both dev and production/Vercel)
globalForPrisma.prisma = db
